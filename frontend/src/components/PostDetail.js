import React from "react";
import "../css/PostDetail.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PostDetail({ item, toggleDetails, user }) {
  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
  const navigate = useNavigate();

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);
  const notifyC = (msg) => toast.success(msg, {autoClose: 7000} );

  const removePost = (postId) => {
    if (window.confirm("Do you really want to delete this post ?")) {
      fetch(`/deletePost/${postId}`, {
        method: "delete",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          toggleDetails();
          navigate("/");
          notifyB(result.message);
        });
    }
  };

  return (
    <div className="showComment">
      <div className="container">
        <div className="postPic">
          <img src={item.photo} alt="" />
        </div>
        <div className="details">
          {/* card header */}
          <div
            className="card-header"
            style={{ borderBottom: "1px solid #00000029" }}
          >
            <div className="card-pic">
              <img
                src={item.postedBy.Photo ? item.postedBy.Photo : picLink}
                alt=""
              />
            </div>
            <h5>{item.postedBy.userName}</h5>
            
            <div
              className="deletePost"
              onClick={() => {
                removePost(item._id);
                notifyC("please wait...deleting..!")
              }}
            >
              <span className="material-symbols-outlined">delete</span>
            </div>
          </div>

          {/* card content */}
          <div className="card-content">
            <p>{item.likes.length} Likes</p>
            <p>{item.body}</p>
          </div>

          {/* commentSection */}
          <div
            className="comment-section"
            style={{ borderBottom: "1px solid #00000029" }}
          >
            {item.comments.map((comment) => {
              return (
                <p className="comm">
                  <span className="commenter" style={{ fontWeight: "bolder" }}>
                    {comment.postedBy.userName}{" "}
                  </span>
                  <span className="commentText">{comment.comment}</span>
                </p>
              );
            })}
          </div>

          
        </div>
      </div>
      <div
        className="close-comment"
        onClick={() => {
          toggleDetails();
        }}
      >
        <span className="material-symbols-outlined material-symbols-outlined-comment">
          close
        </span>
      </div>
    </div>
  );
}