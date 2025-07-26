import type Post from "~/interfaces/Post";

const getPosts = async () => {
  const response = await fetch('https://dev.codeleap.co.uk/careers/');
  return await response.json();
}

const createPost = async ({ user, title, content }: { user: string } & Pick<Post, 'title' | 'content'>) => {
  return await fetch('https://dev.codeleap.co.uk/careers/', {
    method: 'POST',
    body: JSON.stringify({ username: user, title, content }),
    headers: { 'Content-Type': 'application/json' }
  });
}

const updatePost = async ({ id, title, content }: { id: number } & Pick<Post, 'title' | 'content'>) => {
  return await fetch(`https://dev.codeleap.co.uk/careers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ title, content }),
    headers: { 'Content-Type': 'application/json' }
  })
};

const deletePost = async ({ id }: { id: number }) => {
  return await fetch(`https://dev.codeleap.co.uk/careers/${id}/`, { method: 'DELETE' });
};

export { createPost, getPosts, updatePost, deletePost };
