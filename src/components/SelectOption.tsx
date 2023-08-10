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
        <label className="font-serif">{labelText}</label>
        <select
          value={selectValue}
          onChange={handleChange}
          className="ml-3 grow border-2 bg-transparent p-3 pl-3 font-semibold outline-none"
        >
          {options.map((option) => (
            <option
              key={option.value}
              className="bg-white text-black"
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
