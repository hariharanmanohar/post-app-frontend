import { useState, useEffect } from "react";
import "./Posts.css";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const baseUrl = import.meta.env.VITE_BASE_API_URL

  console.log(baseUrl)

  // Fetch all posts
  const fetchPosts = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${baseUrl}/posts`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new post
  const createPost = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${baseUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const newPost = await response.json();
      setPosts((prevPosts) => [...prevPosts, { ...newPost, id: prevPosts.length + 1 }]);
      setTitle("");
      setBody("");
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing post
  const updatePost = async () => {
    if (!editId) return; // Check if editId is set
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${baseUrl}/posts/${editId}?userId=1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }), // You cannot directly send json data in request because server will accept only JSON (JavaScript Object Notation) string so you have to use JSON.stringfy method
      });
      if (!response.ok) { // To know what is response ok visit https://www.w3schools.com/tags/ref_httpmessages.asp
        throw new Error("Network response was not ok");
      }
      const updatedPost = await response.json(); // Get the updated post from the response
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.postId === editId ? updatedPost : post)) // Use the updated post from API
      );
      setTitle("");
      setBody("");
      setIsEditing(false);
      setEditId(null);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a post
  const deletePost = async (id) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${baseUrl}/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.postId !== id));
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission // To understand this visit https://www.shecodes.io/athena/8476-how-to-prevent-return-until-submit-is-clicked-in-react-js
    console.log("Submitting:", { title, body, isEditing }); // Debugging line
    if (isEditing) {
      updatePost();
    } else {
      createPost();
    }
  };

  const handleEdit = (post) => {
    setIsEditing(true);
    setEditId(post.postId);
    setTitle(post.title);
    setBody(post.body);
  };

  return (
    <div className="posts-container">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Something went wrong...</p>}
      {!isLoading && !isError && (
        <div>
          <h1>Posts</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)} //To understand what is e.target.value visit https://stackoverflow.com/questions/71039088/what-is-onchange-e-setnamee-target-value-in-react-mean
                required
              />
            </div>
            <div>
              <label>Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit">{isEditing ? "Update" : "Create"} Post</button>
          </form>
          <ul>
            {posts.map((post) => (
              <li key={post.postId}>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
                <button onClick={() => handleEdit(post)}>Edit</button>
                <button onClick={() => deletePost(post.postId)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Posts;
