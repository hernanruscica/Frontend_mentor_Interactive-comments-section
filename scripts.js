//console.log("from js");

/*Global variables and contants */
let idContainer = "comments-container";
let data = null;
let currentUser = {
    'image' : null,
    'userName': null
}
    
const upVote = (data, id, value) => {       
    data.comments.forEach(comment => {  
        if (comment.id == id) {            
            comment.score += value;
        }        
    });
} 

const getUser = (data) => {   
    currentUser.image = data.currentUser.image.png;
    currentUser.userName = data.currentUser.username;   
}

const toLocalStorage = (data) => {
    let temp = JSON.parse(data);        
    let comments = temp.comments;        
    comments.forEach((comment) => {
        if (comment.hasOwnProperty('replies') == true){
            comment.replies.forEach((reply) => {            
                const myReply = Object.assign(reply, {'parentId': comment.id});
                comments.push(myReply);               
            })         
            delete comment.replies;   
        }
    });      
       
    localStorage.setItem('data', JSON.stringify(temp));    
    return JSON.parse(localStorage.getItem('data'));
} 

const loadComments = (data, idContainer) => {
    let commentsQuantity = data.comments.length;
    let comments = data.comments;
    let userName = data.currentUser.username;       
    document.getElementById(idContainer).innerHTML = "";
   
    comments.forEach(comment => {           
        let currentComment = {...comment};
        if (currentComment.hasOwnProperty('parentId') == false){
            let isOwnComment = (userName == currentComment.user.username) ? true : false;        
            let $comments =  createCommentFragment(currentComment, isOwnComment, currentComment.id);
            document.getElementById(idContainer).appendChild($comments);   
                   
        }
    });  
    comments.forEach(comment => {           
        let currentComment = {...comment};
        if (currentComment.hasOwnProperty('parentId') == true){
            let isOwnComment = (userName == currentComment.user.username) ? true : false;        
            let $comment =  createCommentFragment(currentComment, isOwnComment, currentComment.id);             
            document.getElementById(`comments-item-${currentComment.parentId}`).insertAdjacentElement("afterend", $comment);
                 
        }
    }); 
    if (document.getElementById('textarea-comment-0') == null){ createReplyFrag("0"); } 
}

const createCommentFragment = (comment, isOwnComment = false, idCommentReply) => {    

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
                <button class="comments__item__actions__btn"  id ="reply-comment" data-id = "${idCommentReply}"  >
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
    let  $container = null;
    
    const $replySection =  document.createElement('section');
    $replySection.classList.add('textarea-item');
    
    $replySection.classList.add('comments__item--reply');
    $replySection.innerHTML = `  <textarea class = "textarea-item__textarea " placeholder="Add a reply to the comment..."
                                    name="comment" id="textarea-comment-${dataId}"></textarea>
                                    <img src="${currentUser.image}" alt="avatar image" class="textarea-item__image comments__item__header__round-img">
                                    <button class="btn textarea-item__btn" id = "send-reply" data-id = "${dataId}">SenD</button>
                            `;        
    if (dataId == 0){
        $container = document.getElementById('comments-container');
        $replySection.classList.remove('comments__item--reply');
        $container.appendChild($replySection);    
    }else{   
        $container = document.getElementById(`comments-item-${dataId}`);
        $container.insertAdjacentElement('afterend', $replySection);    
    }
    console.log($container);
    
}

const addReplyToComment = (data, parentId) => {
    let idPrefix = 'textarea-comment-';    
    let replyingTo = null; 
    if (parentId == '0'){
        replyingTo = null;
    }else {
        replyingTo = document.getElementById(`comments-item-${parentId}`).querySelector('header p').innerHTML;
    }
    const textAreaReply = document.getElementById(idPrefix + parentId).value;
         

    let newUniqueId = 0;
    let idExits = data.comments.map(comment => comment.id).filter(commentId => commentId == newUniqueId ).length != 0;
    console.log(idExits);

    while (idExits == true){
        newUniqueId = newUniqueId + 1;
        idExits = data.comments.map(comment => comment.id).filter(commentId => commentId == newUniqueId ).length != 0;
        console.log("ddd");
    
    }

    let newReply = {
                    "id": newUniqueId,
                    "content": textAreaReply,
                    "createdAt": "Now",
                    "score": 0,                    
                    "user": {
                    "image": { 
                        "png": currentUser.image,
                        "webp": `./images/avatars/image-${currentUser.userName}.webp`
                    },
                    "username": currentUser.userName,                   
                    }
                }   
    if (parentId != '0') {
        newReply["parentId"] = parentId
        newReply["replyingTo"] = replyingTo
    } ;
    data.comments.push(newReply);    
    console.log(`Sending a reply to comment with id: ${parentId}`, textAreaReply);
}

const deleteComment = (data, id) => {
    let fakeArgId = 4
    console.log("delete comment id: ", id);
    let temp = data.comments.filter(comment => comment.id != id)    
    return {
            "comments": temp,
            "currentUser": data.currentUser
    };
}

const showModal = (id) => {
    console.log("show modal to delete comment id: ", id);
    let $modalConfirmation = document.createElement('section');
    $modalConfirmation.classList.add('modal-confirmation');
    $modalConfirmation.setAttribute('id', "modal-confirmation");
    $modalConfirmation.innerHTML = `                            
                            <div class="modal-confirmation__window" >
                            <header class="modal-confirmation__window__header">Delete Comment</header>
                            <p class="modal-confirmation__window__text">Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
                            <div class="modal-confirmation__window__buttons">
                                <button class="btn confirmation-btn confirmation-btn--gray" id = "delete-comment-no" data-id = "${id}">no, cancel</button>
                                <button class="btn confirmation-btn confirmation-btn--red" id = "delete-comment-yes" data-id = "${id}">Yes, delete</button>
                            </div>
                            </div>                        
                `;
    document.body.append($modalConfirmation)
}

const hideModal = (id) => {
    const $modal = document.getElementById(id);
    $modal.remove();
    //console.log($modal); 
}

if (localStorage.getItem('data') == null){
    fetch('data.json')
        .then((response) => response.json())
        .then((json) => {       
            //write to the localstorage and a local variable 'data'               
            data = toLocalStorage(JSON.stringify(json))              ;
            getUser(data);  
            loadComments(data, idContainer);    
                  
        });
    }else{
        data = JSON.parse(localStorage.getItem('data'));
        getUser(data);
        loadComments(data, idContainer);            
        
    }


document.addEventListener('click', (e) => {
    //console.log("click en el document", e.target.id)
    if (e.target.id.includes('increment-vote') == true){
        //console.log("increment", e.target.dataset.id) 
        upVote(data, e.target.dataset.id, +1) 
        loadComments(data, idContainer);  
        data = toLocalStorage(JSON.stringify(data));
    }
    if (e.target.id.includes('decrement-vote') == true){
        //console.log("decrement", e.target.dataset.id) 
        upVote(data, e.target.dataset.id, -1) 
        loadComments(data, idContainer);  
        data = toLocalStorage(JSON.stringify(data));
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

    if (e.target.id == "delete-comment"){
        //console.log("delete comment ", e.target.dataset.id);
        showModal(e.target.dataset.id);
    }
    
    if (e.target.id == "delete-comment-no"){        
        console.log("dont delete comment with id: ", e.target.dataset.id);
        hideModal('modal-confirmation');
    }
    if (e.target.id == "delete-comment-yes"){        
        
        data = deleteComment(data, e.target.dataset.id);
        
        loadComments(data, idContainer);    
        data = toLocalStorage(JSON.stringify(data));
        hideModal('modal-confirmation');
    }
})