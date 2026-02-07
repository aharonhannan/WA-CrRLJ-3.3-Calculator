// CrRLJ 3.3 Time for Trial Calculator
// Date calculation logic

class TrialCalculator {
    constructor() {
        this.resets = [];
        this.exclusions = [];
    }

    // Add days to a date, skipping weekends if needed (for certain calculations)
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    // Calculate the number of days between two dates (inclusive of start, exclusive of end)
    daysBetween(startDate, endDate) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((endDate - startDate) / oneDay);
    }

    // Format date for display
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Get the effective commencement date (accounting for resets)
    getEffectiveCommencementDate(initialDate, resets) {
        if (!resets || resets.length === 0) {
            return initialDate;
        }

        // Find the latest reset date
        const sortedResets = [...resets].sort((a, b) => new Date(b.date) - new Date(a.date));
        return new Date(sortedResets[0].date);
    }

    // Calculate total excluded days
    calculateExcludedDays(commencementDate, exclusions) {
        if (!exclusions || exclusions.length === 0) {
            return { totalDays: 0, periods: [] };
        }

        let totalDays = 0;
        const periods = [];

        for (const exclusion of exclusions) {
            const startDate = new Date(exclusion.startDate);
            const endDate = new Date(exclusion.endDate);
            
            // Only count exclusions that are after the commencement date
            if (startDate >= commencementDate) {
                const days = this.daysBetween(startDate, endDate) + 1; // Inclusive
                totalDays += days;
                periods.push({
                    type: exclusion.type,
                    startDate: startDate,
                    endDate: endDate,
                    days: days
                });
            }
        }

        return { totalDays, periods };
    }

    // Get the latest excluded period end date
    getLatestExclusionEndDate(exclusions) {
        if (!exclusions || exclusions.length === 0) {
            return null;
        }

        const sortedExclusions = [...exclusions].sort((a, b) => 
            new Date(b.endDate) - new Date(a.endDate)
        );
        return new Date(sortedExclusions[0].endDate);
    }

    // Main calculation function
    calculate(params) {
        const {
            arraignmentDate,
            custodyStatus,
            releaseDate,
            resets,
            exclusions,
            scheduledTrialDate,
            useCurePeriod
        } = params;

        const initialCommencementDate = new Date(arraignmentDate);
        const effectiveCommencementDate = this.getEffectiveCommencementDate(
            initialCommencementDate, 
            resets
        );

        // Determine base time limit
        let baseTimeLimit = custodyStatus === 'detained' ? 60 : 90;
        let wasReleased = false;

        // Check if defendant was released from jail before 60-day limit expired
        if (custodyStatus === 'detained' && releaseDate) {
            const release = new Date(releaseDate);
            const sixtyDayMark = this.addDays(effectiveCommencementDate, 60);
            
            if (release < sixtyDayMark) {
                baseTimeLimit = 90;
                wasReleased = true;
            }
        }

        // Calculate excluded periods
        const excludedInfo = this.calculateExcludedDays(effectiveCommencementDate, exclusions);
        const latestExclusionEnd = this.getLatestExclusionEndDate(exclusions);

        // Calculate base deadline (commencement date + base limit + excluded days)
        const baseDeadline = this.addDays(
            effectiveCommencementDate, 
            baseTimeLimit + excludedInfo.totalDays
        );

        // Apply 30-day minimum rule after excluded period (section b)(5))
        let finalDeadline = baseDeadline;
        if (latestExclusionEnd) {
            const thirtyDaysAfterExclusion = this.addDays(latestExclusionEnd, 30);
            if (thirtyDaysAfterExclusion > finalDeadline) {
                finalDeadline = thirtyDaysAfterExclusion;
            }
        }

        // Calculate cure period deadline if applicable
        let cureDeadline = null;
        let cureDays = 0;
        if (useCurePeriod) {
            cureDays = custodyStatus === 'detained' ? 14 : 28;
            // Cure period is from the date the continuance is granted, but we'll calculate
            // the maximum possible cure deadline from the original deadline
            cureDeadline = this.addDays(finalDeadline, cureDays);
        }

        // Check if scheduled trial date is timely
        let isTimely = null;
        let daysUntilDeadline = null;
        if (scheduledTrialDate) {
            const trialDate = new Date(scheduledTrialDate);
            const applicableDeadline = useCurePeriod && cureDeadline ? cureDeadline : finalDeadline;
            isTimely = trialDate <= applicableDeadline;
            daysUntilDeadline = this.daysBetween(new Date(), applicableDeadline);
        }

        return {
            initialCommencementDate,
            effectiveCommencementDate,
            baseTimeLimit,
            wasReleased,
            excludedDays: excludedInfo.totalDays,
            excludedPeriods: excludedInfo.periods,
            baseDeadline,
            finalDeadline,
            useCurePeriod,
            cureDays,
            cureDeadline,
            scheduledTrialDate: scheduledTrialDate ? new Date(scheduledTrialDate) : null,
            isTimely,
            daysUntilDeadline,
            resets: resets || []
        };
    }
}

// DOM Management
class TrialCalculatorUI {
    constructor() {
        this.calculator = new TrialCalculator();
        this.resetCounter = 0;
        this.exclusionCounter = 0;
        this.initializeEventListeners();
        this.loadFromLocalStorage();
    }

    initializeEventListeners() {
        // Custody status change
        document.querySelectorAll('input[name="custodyStatus"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleCustodyStatusChange());
        });

        // Add reset button
        document.getElementById('addResetBtn').addEventListener('click', () => this.addResetField());

        // Add exclusion button
        document.getElementById('addExclusionBtn').addEventListener('click', () => this.addExclusionField());

        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', () => this.performCalculation());

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());

        // Print button
        document.getElementById('printBtn').addEventListener('click', () => this.printResults());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
    }

    handleCustodyStatusChange() {
        const status = document.querySelector('input[name="custodyStatus"]:checked').value;
        const releaseGroup = document.getElementById('releaseGroup');
        
        if (status === 'detained') {
            releaseGroup.style.display = 'block';
        } else {
            releaseGroup.style.display = 'none';
            document.getElementById('releaseDate').value = '';
        }
    }

    addResetField() {
        this.resetCounter++;
        const container = document.getElementById('resetsContainer');
        
        const resetDiv = document.createElement('div');
        resetDiv.className = 'dynamic-field';
        resetDiv.id = `reset-${this.resetCounter}`;
        
        resetDiv.innerHTML = `
            <div class="field-header">
                <h4>Reset Event ${this.resetCounter}</h4>
                <button type="button" class="btn-remove" onclick="ui.removeField('reset-${this.resetCounter}')">✕ Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Reset Type:</label>
                    <select class="reset-type">
                        <option value="waiver">Waiver</option>
                        <option value="failure-to-appear">Failure to Appear</option>
                        <option value="new-trial">New Trial/Mistrial</option>
                        <option value="appellate-review">Appellate Review/Stay</option>
                        <option value="collateral">Collateral Proceeding</option>
                        <option value="venue-change">Change of Venue</option>
                        <option value="disqualification">Disqualification of Counsel</option>
                        <option value="deferred-prosecution">Deferred Prosecution</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>New Commencement Date:</label>
                    <input type="date" class="reset-date" required>
                </div>
            </div>
            <div class="form-group">
                <label>Notes:</label>
                <input type="text" class="reset-notes" placeholder="Additional details...">
            </div>
        `;
        
        container.appendChild(resetDiv);
    }

    addExclusionField() {
        this.exclusionCounter++;
        const container = document.getElementById('exclusionsContainer');
        
        const exclusionDiv = document.createElement('div');
        exclusionDiv.className = 'dynamic-field';
        exclusionDiv.id = `exclusion-${this.exclusionCounter}`;
        
        exclusionDiv.innerHTML = `
            <div class="field-header">
                <h4>Excluded Period ${this.exclusionCounter}</h4>
                <button type="button" class="btn-remove" onclick="ui.removeField('exclusion-${this.exclusionCounter}')">✕ Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Exclusion Type:</label>
                    <select class="exclusion-type">
                        <option value="competency">Competency Proceedings</option>
                        <option value="unrelated">Proceedings on Unrelated Charges</option>
                        <option value="continuance">Continuance</option>
                        <option value="dismissal-refiling">Period Between Dismissal and Refiling</option>
                        <option value="related-charge">Disposition of Related Charge</option>
                        <option value="foreign-custody">Foreign or Federal Custody</option>
                        <option value="juvenile">Juvenile Proceedings</option>
                        <option value="unavoidable">Unavoidable/Unforeseen Circumstances</option>
                        <option value="judge-disqualification">Judge Disqualification (5 days)</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date:</label>
                    <input type="date" class="exclusion-start" required>
                </div>
                <div class="form-group">
                    <label>End Date:</label>
                    <input type="date" class="exclusion-end" required>
                </div>
            </div>
            <div class="form-group">
                <label>Notes:</label>
                <input type="text" class="exclusion-notes" placeholder="Additional details...">
            </div>
        `;
        
        container.appendChild(exclusionDiv);
    }

    removeField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.remove();
        }
    }

    collectFormData() {
        const arraignmentDate = document.getElementById('arraignmentDate').value;
        if (!arraignmentDate) {
            alert('Please enter an arraignment date.');
            return null;
        }

        const custodyStatus = document.querySelector('input[name="custodyStatus"]:checked').value;
        const releaseDate = document.getElementById('releaseDate').value;
        const scheduledTrialDate = document.getElementById('trialDate').value;
        const useCurePeriod = document.getElementById('useCurePeriod').checked;

        // Collect resets
        const resets = [];
        document.querySelectorAll('#resetsContainer .dynamic-field').forEach(field => {
            const type = field.querySelector('.reset-type').value;
            const date = field.querySelector('.reset-date').value;
            const notes = field.querySelector('.reset-notes').value;
            
            if (date) {
                resets.push({ type, date, notes });
            }
        });

        // Collect exclusions
        const exclusions = [];
        document.querySelectorAll('#exclusionsContainer .dynamic-field').forEach(field => {
            const type = field.querySelector('.exclusion-type').value;
            const startDate = field.querySelector('.exclusion-start').value;
            const endDate = field.querySelector('.exclusion-end').value;
            const notes = field.querySelector('.exclusion-notes').value;
            
            if (startDate && endDate) {
                exclusions.push({ type, startDate, endDate, notes });
            }
        });

        return {
            arraignmentDate,
            custodyStatus,
            releaseDate,
            resets,
            exclusions,
            scheduledTrialDate,
            useCurePeriod
        };
    }

    performCalculation() {
        const formData = this.collectFormData();
        if (!formData) return;

        const results = this.calculator.calculate(formData);
        this.displayResults(results);
        this.saveToLocalStorage(formData);
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const summaryDiv = document.getElementById('resultSummary');
        const timelineDiv = document.getElementById('timeline');
        const detailsDiv = document.getElementById('calculationDetails');

        // Build summary
        let summaryHTML = '<div class="result-box">';
        
        if (results.scheduledTrialDate) {
            const statusClass = results.isTimely ? 'status-timely' : 'status-untimely';
            const statusText = results.isTimely ? '✓ TIMELY' : '✗ UNTIMELY';
            summaryHTML += `
                <div class="result-status ${statusClass}">
                    <h3>${statusText}</h3>
                    <p>Scheduled Trial: ${this.calculator.formatDate(results.scheduledTrialDate)}</p>
                </div>
            `;
        }

        const applicableDeadline = results.useCurePeriod && results.cureDeadline 
            ? results.cureDeadline 
            : results.finalDeadline;

        summaryHTML += `
            <div class="deadline-info">
                <div class="deadline-item">
                    <label>Trial Deadline:</label>
                    <span class="deadline-date">${this.calculator.formatDate(applicableDeadline)}</span>
                </div>
                ${results.daysUntilDeadline !== null ? `
                    <div class="deadline-item">
                        <label>Days Until Deadline:</label>
                        <span class="days-count">${results.daysUntilDeadline} days</span>
                    </div>
                ` : ''}
            </div>
        `;
        summaryHTML += '</div>';

        summaryDiv.innerHTML = summaryHTML;

        // Build timeline
        let timelineHTML = '<div class="timeline-container"><h3>Timeline</h3>';
        
        timelineHTML += `
            <div class="timeline-event">
                <div class="timeline-date">${this.calculator.formatDate(results.initialCommencementDate)}</div>
                <div class="timeline-content">
                    <strong>Initial Arraignment</strong>
                    <p>Initial commencement date</p>
                </div>
            </div>
        `;

        if (results.resets && results.resets.length > 0) {
            results.resets.forEach(reset => {
                timelineHTML += `
                    <div class="timeline-event timeline-reset">
                        <div class="timeline-date">${this.calculator.formatDate(new Date(reset.date))}</div>
                        <div class="timeline-content">
                            <strong>Commencement Date Reset</strong>
                            <p>${this.getResetTypeLabel(reset.type)}</p>
                            ${reset.notes ? `<p class="notes">${reset.notes}</p>` : ''}
                        </div>
                    </div>
                `;
            });
        }

        if (results.wasReleased) {
            timelineHTML += `
                <div class="timeline-event timeline-info">
                    <div class="timeline-content">
                        <strong>Status Change</strong>
                        <p>Defendant released from jail before 60-day limit expired. Time limit extended to 90 days.</p>
                    </div>
                </div>
            `;
        }

        if (results.excludedPeriods && results.excludedPeriods.length > 0) {
            results.excludedPeriods.forEach(period => {
                timelineHTML += `
                    <div class="timeline-event timeline-exclusion">
                        <div class="timeline-date">${this.calculator.formatDate(period.startDate)} - ${this.calculator.formatDate(period.endDate)}</div>
                        <div class="timeline-content">
                            <strong>Excluded Period (${period.days} days)</strong>
                            <p>${this.getExclusionTypeLabel(period.type)}</p>
                        </div>
                    </div>
                `;
            });
        }

        timelineHTML += `
            <div class="timeline-event timeline-deadline">
                <div class="timeline-date">${this.calculator.formatDate(results.finalDeadline)}</div>
                <div class="timeline-content">
                    <strong>Trial Deadline</strong>
                    <p>${results.baseTimeLimit} days + ${results.excludedDays} excluded days</p>
                </div>
            </div>
        `;

        if (results.useCurePeriod && results.cureDeadline) {
            timelineHTML += `
                <div class="timeline-event timeline-cure">
                    <div class="timeline-date">${this.calculator.formatDate(results.cureDeadline)}</div>
                    <div class="timeline-content">
                        <strong>Cure Period Deadline</strong>
                        <p>Extended by ${results.cureDays} days (one-time extension)</p>
                    </div>
                </div>
            `;
        }

        if (results.scheduledTrialDate) {
            const statusClass = results.isTimely ? 'timeline-trial-timely' : 'timeline-trial-untimely';
            timelineHTML += `
                <div class="timeline-event ${statusClass}">
                    <div class="timeline-date">${this.calculator.formatDate(results.scheduledTrialDate)}</div>
                    <div class="timeline-content">
                        <strong>Scheduled Trial</strong>
                        <p>${results.isTimely ? 'Within allowable time' : 'OUTSIDE ALLOWABLE TIME'}</p>
                    </div>
                </div>
            `;
        }

        timelineHTML += '</div>';
        timelineDiv.innerHTML = timelineHTML;

        // Build calculation details
        let detailsHTML = '<div class="details-container"><h3>Calculation Breakdown</h3>';
        detailsHTML += '<table class="calculation-table">';
        detailsHTML += '<tr><th>Component</th><th>Details</th></tr>';
        
        detailsHTML += `
            <tr>
                <td>Effective Commencement Date</td>
                <td>${this.calculator.formatDate(results.effectiveCommencementDate)}</td>
            </tr>
            <tr>
                <td>Base Time Limit</td>
                <td>${results.baseTimeLimit} days (Defendant ${results.baseTimeLimit === 60 ? 'detained in jail' : 'not detained in jail'})</td>
            </tr>
            <tr>
                <td>Excluded Days</td>
                <td>${results.excludedDays} days</td>
            </tr>
            <tr>
                <td>Base Calculation</td>
                <td>${this.calculator.formatDate(results.effectiveCommencementDate)} + ${results.baseTimeLimit} days + ${results.excludedDays} excluded = ${this.calculator.formatDate(results.baseDeadline)}</td>
            </tr>
        `;

        if (results.excludedPeriods.length > 0) {
            const latestExclusion = results.excludedPeriods.reduce((latest, period) => 
                period.endDate > latest.endDate ? period : latest
            );
            const thirtyDaysAfter = this.calculator.addDays(latestExclusion.endDate, 30);
            
            detailsHTML += `
                <tr>
                    <td>30-Day Minimum Rule</td>
                    <td>Latest exclusion ended ${this.calculator.formatDate(latestExclusion.endDate)}<br>
                        30 days after = ${this.calculator.formatDate(thirtyDaysAfter)}<br>
                        ${thirtyDaysAfter > results.baseDeadline ? '<strong>Applied (extends deadline)</strong>' : 'Not needed (base deadline is later)'}</td>
                </tr>
            `;
        }

        detailsHTML += `
            <tr class="total-row">
                <td><strong>Final Trial Deadline</strong></td>
                <td><strong>${this.calculator.formatDate(results.finalDeadline)}</strong></td>
            </tr>
        `;

        if (results.useCurePeriod && results.cureDeadline) {
            detailsHTML += `
                <tr class="cure-row">
                    <td><strong>With Cure Period</strong></td>
                    <td><strong>${this.calculator.formatDate(results.cureDeadline)}</strong> (+${results.cureDays} days)</td>
                </tr>
            `;
        }

        detailsHTML += '</table></div>';
        detailsDiv.innerHTML = detailsHTML;

        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    getResetTypeLabel(type) {
        const labels = {
            'waiver': 'Waiver',
            'failure-to-appear': 'Failure to Appear',
            'new-trial': 'New Trial/Mistrial',
            'appellate-review': 'Appellate Review/Stay',
            'collateral': 'Collateral Proceeding',
            'venue-change': 'Change of Venue',
            'disqualification': 'Disqualification of Counsel',
            'deferred-prosecution': 'Deferred Prosecution'
        };
        return labels[type] || type;
    }

    getExclusionTypeLabel(type) {
        const labels = {
            'competency': 'Competency Proceedings',
            'unrelated': 'Proceedings on Unrelated Charges',
            'continuance': 'Continuance',
            'dismissal-refiling': 'Period Between Dismissal and Refiling',
            'related-charge': 'Disposition of Related Charge',
            'foreign-custody': 'Foreign or Federal Custody',
            'juvenile': 'Juvenile Proceedings',
            'unavoidable': 'Unavoidable/Unforeseen Circumstances',
            'judge-disqualification': 'Judge Disqualification'
        };
        return labels[type] || type;
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? All data will be cleared.')) {
            document.getElementById('arraignmentDate').value = '';
            document.getElementById('releaseDate').value = '';
            document.getElementById('trialDate').value = '';
            document.getElementById('useCurePeriod').checked = false;
            document.querySelectorAll('input[name="custodyStatus"]')[0].checked = true;
            document.getElementById('releaseGroup').style.display = 'none';
            document.getElementById('resetsContainer').innerHTML = '';
            document.getElementById('exclusionsContainer').innerHTML = '';
            document.getElementById('resultsSection').style.display = 'none';
            this.resetCounter = 0;
            this.exclusionCounter = 0;
            localStorage.removeItem('crrlj3-calculator-data');
        }
    }

    printResults() {
        window.print();
    }

    exportResults() {
        const results = this.collectFormData();
        if (!results) return;

        const calculated = this.calculator.calculate(results);
        
        let text = 'WA CrRLJ 3.3 TIME FOR TRIAL CALCULATION\n';
        text += '='.repeat(50) + '\n\n';
        text += `Generated: ${new Date().toLocaleString()}\n\n`;
        text += `Arraignment Date: ${this.calculator.formatDate(new Date(results.arraignmentDate))}\n`;
        text += `Custody Status: ${results.custodyStatus === 'detained' ? 'Detained in Jail' : 'Not Detained in Jail'}\n`;
        text += `Base Time Limit: ${calculated.baseTimeLimit} days\n\n`;
        
        if (calculated.resets.length > 0) {
            text += 'COMMENCEMENT DATE RESETS:\n';
            calculated.resets.forEach((reset, i) => {
                text += `  ${i + 1}. ${this.getResetTypeLabel(reset.type)} - ${this.calculator.formatDate(new Date(reset.date))}\n`;
            });
            text += '\n';
        }

        if (calculated.excludedPeriods.length > 0) {
            text += 'EXCLUDED PERIODS:\n';
            calculated.excludedPeriods.forEach((period, i) => {
                text += `  ${i + 1}. ${this.getExclusionTypeLabel(period.type)}\n`;
                text += `     ${this.calculator.formatDate(period.startDate)} to ${this.calculator.formatDate(period.endDate)} (${period.days} days)\n`;
            });
            text += `\nTotal Excluded Days: ${calculated.excludedDays}\n\n`;
        }

        const deadline = calculated.useCurePeriod && calculated.cureDeadline 
            ? calculated.cureDeadline 
            : calculated.finalDeadline;

        text += `TRIAL DEADLINE: ${this.calculator.formatDate(deadline)}\n`;
        
        if (calculated.useCurePeriod) {
            text += `(Includes ${calculated.cureDays}-day cure period)\n`;
        }

        if (calculated.scheduledTrialDate) {
            text += `\nScheduled Trial: ${this.calculator.formatDate(calculated.scheduledTrialDate)}\n`;
            text += `Status: ${calculated.isTimely ? 'TIMELY' : 'UNTIMELY'}\n`;
        }

        // Download as text file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CrRLJ3.3-Calculation-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    saveToLocalStorage(data) {
        try {
            localStorage.setItem('crrlj3-calculator-data', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('crrlj3-calculator-data');
            if (saved) {
                const data = JSON.parse(saved);
                // Optionally restore previous calculation on load
                // (commented out to start fresh each time)
                // this.restoreFormData(data);
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }
}

// Initialize the application
let ui;
document.addEventListener('DOMContentLoaded', () => {
    ui = new TrialCalculatorUI();
});
