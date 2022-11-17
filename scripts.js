//console.log("from js");

/*Global variables and contants */
let idContainer = "comments-container";
let data = null;
let currentUser = {
    'image' : null,
    'userName': null
}
let commentsCounter = 1;


    
const upVote = (data, id, value) => {       
    data.comments.forEach(comment => {  
        if (comment.id == id) {            
            comment.score += value;
        }
        comment.replies.forEach((reply) => {            
            if (reply.id == id) {                
                reply.score += value;
            }
        })
    });
} 


const getUser = (data) => {   
    currentUser.image = data.currentUser.image.png;
    currentUser.userName = data.currentUser.username;   
}

const toLocalStorage = (data) => {
    localStorage.setItem('data', data);    
    return JSON.parse(localStorage.getItem('data'));
} 

const loadComments = (json, idContainer) => {
    let commentsQuantity = json.comments.length;
    let comments = json.comments;
    let userName = json.currentUser.username;       
    document.getElementById(idContainer).innerHTML = "";
    comments.forEach(comment => {           
        let currentComment = {...comment};
        let isOwnComment = (userName == currentComment.user.username) ? true : false;        
        let $comments =  createCommentFragment(currentComment, isOwnComment);
        document.getElementById(idContainer).appendChild($comments);   
        commentsCounter += 1;
        
        comment.replies.forEach((reply) => {                
            currentComment = {...reply};
            let isOwnComment = (userName == currentComment.user.username) ? true : false;            
            $comments =  createCommentFragment(currentComment, isOwnComment);            
            document.getElementById(idContainer).appendChild($comments);
            commentsCounter += 1;
        })
    });  
}

const createCommentFragment = (comment, isOwnComment = false) => {    

    let $section = document.createElement("section");
    let mention = '';
    $section.classList.add('comments__item');    
    $section.setAttribute('id', `comments-item-${comment.id}`);
    if (comment.hasOwnProperty('replyingTo') == true){
        $section.classList.add('comments__item--reply');
        mention = `<a href = "" class="user-mention">@${comment.replyingTo}</a>  `;
    }

    let actions = "", you = "";
    if (isOwnComment == true){
        actions = `
                    <button class="comments__item__actions__btn comments__item__actions__btn--red" id ="delete-comment" data-id = "${comment.id}">
                    <i class="fa-solid fa-trash"></i>
                        Delete
                    </button>          
                    <button class="comments__item__actions__btn" id ="edit-comment"  data-id = "${comment.id}" >
                        <i class="fa-solid fa-pen"></i>
                        Edit
                    </button>   
                `;
        you = `<p class="comments__item__header__you comments__item__header__you--visible">You</p>`;
    }else{
        actions = `
                <button class="comments__item__actions__btn"  id ="reply-comment" data-id = "${comment.id}"  >
                    <i class="fa-solid fa-reply"></i>
                    Reply
                </button>   
                `;
        you = ""
    }

    $section.innerHTML = `
    <header class="comments__item__header">
      <img src="${comment.user.image.png}" alt="image avatar of ${comment.user.username}" class="comments__item__header__round-img">
      <p class="comments__item__header__username">${comment.user.username}</p>
      ${you}
      <p class="comments__item__header__date">${comment.createdAt}</p>
    </header>
    <p class="comments__item__content">
      ${mention + comment.content}
    </p>
    <div class="comments__item__votes">
      <button class="comments__item__votes__btn " id ="increment-vote" data-id = "${comment.id}">+</button>
      <p class="comments__item__votes__quantity">${comment.score}</p>
      <button class="comments__item__votes__btn " id ="decrement-vote" data-id = "${comment.id}">-</button>
    </div>
    <div class="comments__item__actions">                
        ${actions}
    </div>`     
    return $section;
}

const createReplyFrag = (dataId) => {    
    const $container = document.getElementById(`comments-item-${dataId}`);
    const $replySection =  document.createElement('section');
    $replySection.classList.add('textarea-item');
    
    $replySection.classList.add('comments__item--reply');
    $replySection.innerHTML = `  <textarea class = "textarea-item__textarea " placeholder="Add a reply to the comment..."
                                    name="comment" id="textarea-comment-${dataId}" ></textarea>
                                    <img src="${currentUser.image}" alt="avatar image" class="textarea-item__image comments__item__header__round-img">
                                    <button class="btn textarea-item__btn" id = "send-reply" data-id = "${dataId}">SenD</button>
                            `;        
    $container.insertAdjacentElement('afterend', $replySection);    
}

const addReplyToComment = (data, parentId) => {
    let idPrefix = 'textarea-comment-';    
    let replyingTo = document.getElementById(`comments-item-${parentId}`).querySelector('header p').innerHTML;
    const textAreaReply = document.getElementById(idPrefix + parentId).value;
    let newUniqueId = commentsCounter + 1
    let newReply = {
                    "id": newUniqueId,
                    "content": textAreaReply,
                    "createdAt": "Now",
                    "score": 0,
                    "replyingTo": replyingTo,
                    "user": {
                    "image": { 
                        "png": currentUser.image,
                        "webp": `./images/avatars/image-${currentUser.userName}.webp`
                    },
                    "username": currentUser.userName
                    }
                }    
    data.comments.forEach((comment) => {
        if (comment.id == parentId){
            comment.replies.unshift(newReply);
        }
    })

    console.log(`Sending a reply to comment with id: ${parentId}`, textAreaReply);

}

if (localStorage.getItem('data') == null){
    fetch('data.json')
        .then((response) => response.json())
        .then((json) => {       
            //write to the localstorage and a local variable 'data'               
            data = toLocalStorage(JSON.stringify(json))              ;
            loadComments(data, idContainer);    
            getUser(data);        
        });
    }else{
        data = JSON.parse(localStorage.getItem('data'));
        loadComments(data, idContainer);    
        getUser(data);
    }


document.addEventListener('click', (e) => {
    //console.log("click en el document", e.target.id)
    if (e.target.id.includes('increment-vote') == true){
        //console.log("increment", e.target.dataset.id) 
        upVote(data, e.target.dataset.id, +1) 
        loadComments(data, idContainer);  
    }
    if (e.target.id.includes('decrement-vote') == true){
        //console.log("decrement", e.target.dataset.id) 
        upVote(data, e.target.dataset.id, -1) 
        loadComments(data, idContainer);  
    }
    if (e.target.id == "delete-comment"){
        console.log("delete comment ", e.target.dataset.id);
    }
    if (e.target.id == "edit-comment"){
        console.log("edit comment ", e.target.dataset.id);
    }
    if (e.target.id == "reply-comment"){
        //console.log("reply comment ", e.target.dataset.id);
        createReplyFrag(e.target.dataset.id);        
        e.target.setAttribute('disabled', 'false');
        e.target.setAttribute('style', 'display: none;');        
    }

    if (e.target.id == "send-reply"){        
        addReplyToComment(data, e.target.dataset.id);        
        loadComments(data, idContainer);    
        data = toLocalStorage(JSON.stringify(data));
    }
})
