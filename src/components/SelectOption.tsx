interface option {
    value: string;
    text: string;
}

interface PropTypes {
    options: option[];
    labelText: string;
    selectValue: string;
    handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectOption = ({ options, labelText, selectValue, handleChange}: PropTypes) => {
    return (
      <>
        <label>{labelText}</label>
        <select
          value={selectValue}
          onChange={handleChange}
          className="grow bg-transparent pl-3 outline-none"
        >
          {options.map((option) => (
            <option
              key={option.value}
              className="text-black"
              value={option.value}
            >
              {option.text}
            </option>
          ))}
        </select>
      </>
    );
};

export default SelectOption;
