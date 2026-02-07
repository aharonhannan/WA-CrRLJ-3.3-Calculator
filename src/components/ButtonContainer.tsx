import { STRINGS } from '../strings';

interface ButtonContainerProps {
  onCalculate: () => void;
  onClear: () => void;
}

function ButtonContainer({ onCalculate, onClear }: ButtonContainerProps) {
  return (
    <div className="button-container">
      <button type="button" className="btn-primary" onClick={onCalculate}>
        {STRINGS.buttons.calculate}
      </button>
      <button type="button" className="btn-secondary" onClick={onClear}>
        {STRINGS.buttons.clearForm}
      </button>
    </div>
  );
}

export default ButtonContainer;
