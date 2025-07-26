import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useContext, useRef, useState, type FormEvent } from "react";
import { FiAlertTriangle, FiCheckCircle, FiEdit, FiThumbsUp, FiTrash } from "react-icons/fi";
import { Fragment } from "react/jsx-runtime";
import { deletePost, updatePost } from "~/api/posts";
import Button from "~/components/Button";
import Input from "~/components/Input";
import Textarea from "~/components/Textarea";
import { ModalContext } from "~/contexts/ModalContext";
import { UserContext } from "~/contexts/UserContext";
import type Post from "~/interfaces/Post";
import getRelativeDateDiff from "~/utils/getRelativeDateDiff";

interface Props {
  post: Post;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title?: string, subtitle?: string) => void;
}

const ConfirmDelete = ({ handleDelete, post }: { post: Post, handleDelete: (id: number) => void }) => {
  const modalContext = useContext(ModalContext);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6 min-w-[350px] md:min-w-[660px]">
      <p className="font-bold text-xl mb-4">Are you sure you want to delete this item?</p>
      <div className="flex justify-end gap-2">
        <Button className="bg-transparent border border-[#999] !text-black" onClick={modalContext?.closeCurrentModal}>Cancel</Button>
        <Button className="bg-red-500" onClick={() => handleDelete(post.id)}>Delete</Button>
      </div>
    </div>
  );
}

const ErrorModal = () => {
  const modalContext = useContext(ModalContext);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6">
      <FiAlertTriangle size={50} className="self-center text-red-500 mb-2" />
      <p className="text-gray-400 font-medium mb-4">An unknown error happened. We don't know what it is.</p>
      <Button className="bg-red-500" onClick={modalContext?.closeCurrentModal}>Ok, let's try again</Button>
    </div>
  );
}

const SuccessModal = ({ title, subtitle }: { title: string, subtitle: string }) => {
  const modalContext = useContext(ModalContext);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6">
      <FiCheckCircle size={50} className="self-center text-green-500 mb-2" />
      <h5 className="text-2xl font-bold text-green-500 mb-0.5">{title}</h5>
      <p className="self-center text-gray-400 mb-4">{subtitle}</p>
      <Button className="bg-green-500" onClick={modalContext?.closeCurrentModal}>Great to know!</Button>
    </div>
  );
}

const EditModal = ({ post, handleEdit }: { post: Post, handleEdit: (id: number, title?: string, subtitle?: string) => void }) => {

  const modalContext = useContext(ModalContext);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleChangePostData = useCallback(() => {
    if (titleRef.current?.value.trim() === '' || contentRef.current?.value.trim() === '')
      setSubmitDisabled(true);
    else if (submitDisabled)
      setSubmitDisabled(false);
  }, []);

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onMutate: () => setUpdating(true),
    onSuccess: async (response: Response) => {
      if (response.status !== 200) {
        alert('An unknown error has happened. Please, try again!');
        return;
      }

      modalContext?.setCurrentModal(<SuccessModal title="Updated" subtitle="Post successfully updated!" />);
      handleEdit(post.id, titleRef.current?.value, contentRef.current?.value);
    },
    onSettled: () => setUpdating(false),
  });

  const handleUpdatePost = useCallback((event: FormEvent) => {
    event.preventDefault();
    updatePostMutation.mutate({ id: post.id, title: titleRef.current?.value ?? '', content: contentRef.current?.value ?? '' })
  }, [updatePostMutation]);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6 min-w-[350px] md:min-w-[660px]">
      <h5 className="font-bold text-xl mb-6">Edit item</h5>
      <form className="flex flex-col" onSubmit={handleUpdatePost}>
        <div className="flex flex-col text-left mb-6">
          <label htmlFor="title">Title</label>
          <Input ref={titleRef} type="text" name="title" id="title" placeholder="Hello World" onChange={handleChangePostData} defaultValue={post.title} required />
        </div>
        <div className="flex flex-col text-left mb-6">
          <label htmlFor="content">Content</label>
          <Textarea ref={contentRef} name="content" id="content" placeholder="Content here" onChange={handleChangePostData} defaultValue={post.content} required />
        </div>

        <div className="flex justify-end items-center gap-2">
          <Button type="button" className="bg-transparent border border-[#999] !text-black" onClick={modalContext?.closeCurrentModal}>Cancel</Button>
          <Button type="submit" className={`${submitDisabled || updating ? 'opacity-80 ' : ''}transition-opacity`} disabled={submitDisabled || updating}>
            {updating ? 'Updating...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}

const PostComponent = ({ post, onLike, onDelete, onEdit }: Props) => {
  const userContext = useContext(UserContext);
  const modalContext = useContext(ModalContext);

  const [deleting, setDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onMutate: () => setDeleting(true),
    onSuccess: async (response: Response) => {
      if (response.status !== 204) {
        modalContext?.setCurrentModal(<ErrorModal />);
        return;
      }

      modalContext?.setCurrentModal(<SuccessModal title="Deleted!" subtitle="Post successfully deleted" />);
      onDelete(post.id);
    }
  });

  const handleDelete = useCallback((id: number) => {
    modalContext?.closeCurrentModal();
    deleteMutation.mutate({ id });
  }, [modalContext, deleteMutation]);

  const toggleLiked = useCallback(() => onLike(post.id), [post, onLike]);

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} exit={{ opacity: 0, scale: 0 }} className="mb-6">
      <header className="bg-[#7695EC] border border-[#7695EC] rounded-t-2xl p-6">
        <div className="flex justify-between items-center">
          <h5 className="text-xl font-bold text-white">{post.title}</h5>
          {
            post.username === userContext?.loggedName && (
              <div className="flex gap-4">
                <FiTrash
                  size={25}
                  className="text-white cursor-pointer"
                  onClick={deleting ? undefined : () => modalContext?.setCurrentModal(<ConfirmDelete post={post} handleDelete={handleDelete} />)}
                />
                <FiEdit size={25} className="text-white cursor-pointer" onClick={() => modalContext?.setCurrentModal(<EditModal post={post} handleEdit={onEdit} />)} />
              </div>
            )
          }
        </div>
      </header>
      <div className="rounded-b-2xl border border-[#999] p-6">
        <div className="flex justify-between items-center flex-wrap mb-4">
          <p className="font-bold text-lg text-[#777]">@{post.username}</p>
          <p className="text-lg text-[#777]">{getRelativeDateDiff(new Date(), new Date(post.created_datetime))}</p>
        </div>
        <div className="mb-6">
          <p className="text-lg">
            {
              post.content.split('\n').map((e, idx) => (
                <Fragment key={idx}>
                  {
                    e.split(/(@[a-z0-9.-0]+)/ig).map((t, i) => (
                      t.startsWith('@') ? (
                        <span key={i} className="font-bold text-[#7695EC]">{t}</span>
                      ) : (
                        <span key={i}>{t}</span>
                      )
                    ))
                  }
                  <br />
                </Fragment>
              ))
            }
          </p>
        </div>
        <div>
          <AnimatePresence mode="wait">
            <motion.p className="inline-block" key={`${post.liked}`} initial={{ rotate: -15, y: -5 }} animate={{ rotate: 0, y: 0 }} exit={{ rotate: -15, y: -5 }}>
              {
                post.liked ? (
                  <FiThumbsUp size={20} className="cursor-pointer text-[#7695EC]" onClick={toggleLiked} />
                ) : (
                  <FiThumbsUp size={20} className="cursor-pointer" onClick={toggleLiked} />
                )
              }
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default PostComponent;