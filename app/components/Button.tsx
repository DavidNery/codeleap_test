const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button {...props} className={`${props.className} bg-[#7695EC] py-1.5 px-7 font-bold text-white rounded-lg cursor-pointer disabled:cursor-no-drop`}>
      {props.children}
    </button>
  );
};

export default Button;