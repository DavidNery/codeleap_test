import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { FiAlertTriangle, FiCheck, FiLogOut, FiXCircle } from "react-icons/fi";
import { createPost, getPosts } from "~/api/posts";
import Button from "~/components/Button";
import Input from "~/components/Input";
import Select from "~/components/Select";
import Textarea from "~/components/Textarea";
import { ModalContext } from "~/contexts/ModalContext";
import { UserContext } from "~/contexts/UserContext";
import type Post from "~/interfaces/Post";
import PostComponent from "./components/PostComponent";

interface Filter {
  query?: string,
  sort?: 'date_asc' | 'date_desc'
}

const ErrorModal = ({ error, btnText }: { error: string, btnText: string }) => {
  const modalContext = useContext(ModalContext);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6">
      <FiAlertTriangle size={50} className="self-center text-red-500 mb-2" />
      <p className="text-gray-400 font-medium mb-4">{error}</p>
      <Button className="bg-red-500" onClick={modalContext?.closeCurrentModal}>{btnText}</Button>
    </div>
  );
}

const SuccessModal = ({ message, btnText }: { message: string, btnText: string }) => {
  const modalContext = useContext(ModalContext);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6">
      <FiCheck size={50} className="self-center text-green-500 mb-2" />
      <p className="text-gray-400 font-medium mb-4">{message}</p>
      <Button className="bg-green-500" onClick={modalContext?.closeCurrentModal}>{btnText}</Button>
    </div>
  );
}

const Main = () => {

  const userContent = useContext(UserContext);
  const modalContent = useContext(ModalContext);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<Filter>({});
  const [posts, setPosts] = useState<Post[]>([]);

  const { isFetching, data } = useQuery({ queryKey: ['getposts'], queryFn: getPosts });
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onMutate: () => {
      setCreating(true)
    },
    onSuccess: async (response: Response) => {
      const json = await response.json();
      if (response.status !== 200) {
        modalContent?.setCurrentModal(<ErrorModal error={json.detail} btnText="Ok, I'll fix it" />);
        return;
      }

      if (titleRef.current) titleRef.current.value = '';
      if (contentRef.current) contentRef.current.value = '';
      modalContent?.setCurrentModal(<SuccessModal message="Post successfully created!" btnText="Check it now!" />);
      setPosts(old => [json, ...old]);
    },
    onSettled: () => setCreating(false)
  });

  const handleCreatePost = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = titleRef.current?.value;
    const content = contentRef.current?.value;

    if (!title || !content) {
      modalContent?.setCurrentModal(<ErrorModal error='You need to provide the post title and content!' btnText="Ok, I'll provide it" />);
      return;
    }

    createPostMutation.mutate({ user: userContent?.loggedName ?? '', title, content })
  }, [modalContent, createPostMutation]);

  const handleChangePostData = useCallback(() => {
    if (titleRef.current?.value.trim() === '' || contentRef.current?.value.trim() === '')
      setSubmitDisabled(true);
    else if (submitDisabled)
      setSubmitDisabled(false);
  }, [submitDisabled, setSubmitDisabled]);

  const handleDelete = useCallback((id: number) => {
    setPosts(old => old.filter(post => post.id !== id))
  }, [setPosts]);

  const handleEdit = useCallback((id: number, title?: string, content?: string) => {
    setPosts(old => old.map(p => {
      if (p.id === id) {
        return { ...p, title: title ?? p.title, content: content ?? p.content };
      } else
        return p;
    }))
  }, [setPosts]);

  const handleLike = useCallback((id: number) => {
    setPosts(old => old.map(p => {
      if (p.id === id)
        return { ...p, liked: !p.liked };
      else
        return p;
    }))
  }, [setPosts]);

  const handleLogout = useCallback(() => {
    if (!userContent) return;
    userContent.logout();
  }, [userContent]);

  const handleFilter = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = event.currentTarget;
    if (event.currentTarget.tagName === 'INPUT')
      setFilter(old => ({ ...old, query: value.trim() === '' ? undefined : value.trim() }));
    else {
      if (value !== 'date_asc' && value !== 'date_desc') return;
      setFilter(old => ({ ...old, sort: value }));
    }
  }, [setFilter]);

  useEffect(() => {
    if (isFetching) return;
    if (posts.length > 0) return;
    setPosts(data.results);
  }, [posts, isFetching, data]);

  useEffect(() => {
    if (Object.keys(filter).length === 0) return;
    setPosts(() => {
      let copyResults = [...data.results];
      if (filter.query) {
        const lowerQuery = filter.query.toLowerCase();
        copyResults = copyResults.filter(p => p.title.toLowerCase().indexOf(lowerQuery) !== -1 || p.content.toLowerCase().indexOf(lowerQuery) !== -1)
      }
      if (filter.sort) {
        const compareFn = filter.sort === 'date_asc' ?
          (p1: Post, p2: Post) => new Date(p2.created_datetime).getTime() - new Date(p1.created_datetime).getTime() :
          (p1: Post, p2: Post) => new Date(p1.created_datetime).getTime() - new Date(p2.created_datetime).getTime();
        copyResults = copyResults.sort(compareFn);
      }

      return copyResults;
    });
  }, [filter]);

  return (
    <div className="bg-white border border-[#CCC] sm:min-w-[500px] max-w-[800px]">
      <header className="p-6 bg-[#7695EC] text-white">
        <h5 className="font-bold text-xl mb-0.5">CodeLeap Network</h5>
        <div className="flex justify-between items-center text-sm text-white/90 font-medium">
          <p>Logged as {userContent?.loggedName}</p>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleLogout}>
            <span>Logout</span>
            <FiLogOut size={15} />
          </div>
        </div>
      </header>
      <div className="p-6">
        <div className="rounded-2xl border border-[#999] p-6 mb-6">
          <form className="flex flex-col" onSubmit={handleCreatePost}>
            <h5 className="font-bold text-xl mb-6">What's on your mind?</h5>

            <div className="flex flex-col text-left mb-6 peer">
              <label htmlFor="title">Title</label>
              <Input ref={titleRef} type="text" name="title" id="title" placeholder="Hello World" onChange={handleChangePostData} required />
            </div>
            <div className="flex flex-col text-left mb-6 peer">
              <label htmlFor="content">Content</label>
              <Textarea ref={contentRef} name="content" id="content" placeholder="Content here" onChange={handleChangePostData} required />
            </div>

            <Button type="submit" className="peer-has-invalid:opacity-80 self-end transition-opacity" disabled={submitDisabled || creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </div>
        <div className="rounded-2xl border border-[#999] p-6 mb-6">
          <h5 className="font-bold text-xl mb-6">What about some filters?</h5>
          <div className="flex justify-between items-end gap-2 flex-wrap">
            <div className="flex flex-col basis-1/2">
              <label htmlFor="query">Search by post title or content</label>
              <Input type="text" id="query" placeholder="Beautiful" onChange={handleFilter} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <label htmlFor="filter">Filter by: </label>
              <Select id="filter" onChange={handleFilter}>
                <option value="date_asc">Date (Newest first)</option>
                <option value="date_desc">Date (Oldest first)</option>
              </Select>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${isFetching}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {
              isFetching ? (
                <div className="relative max-h-[350px] overflow-hidden after:absolute after:left-0 after:bottom-0 after:w-full after:h-[200px] after:bg-gradient-to-t after:from-white after:to-white/0">
                  {
                    new Array(2).fill(1).map((_, idx) => (
                      <div key={idx} className="mb-6">
                        <header className="bg-[#7695EC] border border-[#7695EC] rounded-t-2xl p-6">
                          <div className="h-6 w-48 bg-white/60 rounded-md animate-pulse"></div>
                        </header>
                        <div className="rounded-b-2xl border border-[#999] p-6 animate-pulse">
                          <div className="flex justify-between items-center mb-4">
                            <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
                            <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-2 h-5 rounded bg-gray-200"></div>
                              <div className="col-span-1 h-5 rounded bg-gray-200"></div>
                            </div>
                            <div className="h-5 rounded bg-gray-200"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                posts.length === 0 ? (
                  <div className="text-center">
                    <FiXCircle size={60} className="inline-block text-[#7695EC] mb-1.5" />
                    <p className="text-gray-400">There's no posts created yet =(</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {posts.map((post, idx) => <PostComponent key={idx} post={post} onLike={handleLike} onDelete={handleDelete} onEdit={handleEdit} />)}
                  </AnimatePresence>
                )
              )
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Main;