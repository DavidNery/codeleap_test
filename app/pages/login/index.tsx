import { useCallback, useContext, useState, type ChangeEvent, type FormEvent } from "react";
import { FiAlertTriangle, FiUser } from "react-icons/fi";
import Button from "~/components/Button";
import Input from "~/components/Input";
import { ModalContext } from "~/contexts/ModalContext";
import { UserContext } from "~/contexts/UserContext";

const ProvideUserModal = () => {
  const modalContext = useContext(ModalContext);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6">
      <FiAlertTriangle size={50} className="self-center text-red-500 mb-2" />
      <p className="text-gray-400 font-medium mb-4">You need to provide a username before continue!</p>
      <Button className="bg-red-500" onClick={modalContext?.closeCurrentModal}>Ok, I'll provide</Button>
    </div>
  );
}

const LoggedInModal = ({ name }: { name: string }) => {
  const modalContext = useContext(ModalContext);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6">
      <FiUser size={50} className="self-center text-green-500 mb-2" />
      <h5 className="text-2xl font-bold text-green-500 mb-0.5">Logged in!</h5>
      <p className="self-center text-gray-400 mb-4">Welcome, {name}!</p>
      <Button className="bg-green-500" onClick={modalContext?.closeCurrentModal}>Let's go!</Button>
    </div>
  );
}

const Login = () => {

  const userContext = useContext(UserContext);
  const modalContext = useContext(ModalContext);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.trim() === '')
      setSubmitDisabled(true);
    else if (submitDisabled)
      setSubmitDisabled(false);
  }, [submitDisabled, setSubmitDisabled]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    if (!userContext || !modalContext) return;

    event.preventDefault();
    event.currentTarget.blur();
    const data = new FormData(event.currentTarget);

    const name = data.get('name') as string;
    if (name.trim() === '') {
      modalContext.setCurrentModal(<ProvideUserModal />);
      return;
    }

    modalContext.setCurrentModal(
      (<LoggedInModal name={name} />),
      () => userContext.doLogin(name)
    );
  }, [userContext, modalContext]);

  return (
    <div className="bg-white border border-[#CCC] rounded-2xl sm:min-w-[500px]">
      <header className="p-6 pb-0">
        <h5 className="font-bold text-xl">Welcome to CodeLeap network!</h5>
      </header>
      <div className="p-6">
        <form className="text-end" onSubmit={handleSubmit}>
          <div className="flex flex-col text-left mb-4 peer">
            <label htmlFor="name">Please enter your username</label>
            <Input type="text" name="name" id="name" placeholder="John Doe" onChange={handleChange} required />
          </div>
          <Button type="submit" className="peer-has-invalid:opacity-80 self-end transition-opacity" disabled={submitDisabled}>ENTER</Button>
        </form>
      </div>
    </div>
  );
};

export default Login;