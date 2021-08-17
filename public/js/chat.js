const socket = io();

//Elements
const $messageForm = document.getElementById("form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.getElementById("send-location");
const $messages = document.getElementById("messages")


//Templates
const messageTemplate= document.getElementById("message-template").innerHTML
const locationTemplate= document.getElementById("location-message-template").innerHTML
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML

//Options
const {username , room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () =>{
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight +newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
         $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message' , (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage' ,(message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room , users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.getElementById("sidebar").innerHTML = html
})

document.getElementById("form").addEventListener('submit',(e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendmessage', message , (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '';
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
        
    })
})

document.getElementById("send-location").addEventListener('click',()=>{
    

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!!')
    }
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position,message)=>{
   console.log(position)
    socket.emit('sendLocation',{
        latitude : position.coords.latitude ,
        longitude : position.coords.longitude 
    }, ()=>{
        console.log('Location shared!')
        $locationButton.removeAttribute('disabled')
    })
    })
})

socket.emit('join', {username,room},(error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})