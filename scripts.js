console.log("from js");

fetch('data.json')
    .then((response) => response.json())
    .then((json) => { 
        console.log(json);
        getUser(json);
        console.log("hola ", user.username);
        console.log("tu imagen es : ", user.image);
        const comment = getComment(json, 0);
        console.log(comment != null ? comment.content : "no encontrado");
    });

let user = {
    "image" : null,
    "username" : null
}
let comment = {
    "id" : null,
    "content": null,
    "createdAt": null,
    "score": null,
    "user": null,
    "replies": null
}
    
const getUser = (json) => {
    user.image = json.currentUser.image.png;
    user.username = json.currentUser.username;
}

const getComment = (json, id) => {
    if (json.comments[id] != null){
        console.log("encontrado");
        return json.comments[id];
    }else{
        console.log("no encontrado");
        return null;
    }    
}