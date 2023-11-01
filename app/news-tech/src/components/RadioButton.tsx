type RadioButtonProps = {
  label: string;
  value: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function RadioButton({
  label,
  value,
  checked,
  onChange,
}: RadioButtonProps) {
  return (
    <label className="text-xs flex items-center gap-1">
      <input type="radio" value={value} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
