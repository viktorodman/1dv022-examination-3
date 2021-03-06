/**
 * Module for ChatDisplay
 *
 * Change The Socket URl AND the socket key
 * if you want to change the server
 *
 * @module src/js/apps/Chat-App/chat-display
 * @author Viktor Ödman
 * @version 1.0.0
*/

import './chat-message.js'
import './message-area.js'
import './channel-picker.js'
const template = document.createElement('template')
template.innerHTML = `
    <style>
    .messageContainer {
        height: 65%;
        overflow: auto;
        padding: 12px;
    }
    .messageContainer::-webkit-scrollbar {
      width: 5px;
      height: 8px;
      background-color: #7FDBFF;
    }
    .messageContainer::-webkit-scrollbar-thumb {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      background-color: #111111;
      border-radius: 10px;
    }
    .nameChange {
        margin-left: 15px;
        color: #7FDBFF;
        background-color: #111111;
        border: none;
        margin-bottom: 2px;
        outline: none;
        transition-duration: 0.4s;
    }
    .nameChange:hover {
        background-color: #7FDBFF;
        color: #111111;
    }
    </style>
    <channel-picker></channel-picker>
    <div class="messageContainer">
    </div>
    <button class="nameChange">Change Name</button>
    <message-area></message-area>
`

/**
 * Represent a Chat Display
 *
 * @class ChatDisplay
 * @extends {window.HTMLElement}
 */
class ChatDisplay extends window.HTMLElement {
  /**
   * Creates an instance of ChatDisplay.
   * @memberof ChatDisplay
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this._socket = undefined
    this._userMessage = this.shadowRoot.querySelector('message-area')
    this._channelPicker = this.shadowRoot.querySelector('channel-picker')
    this._messageContainer = this.shadowRoot.querySelector('.messageContainer')
    this._changeName = this.shadowRoot.querySelector('.nameChange')
    this._channelName = ''
    this._userName = JSON.parse(window.localStorage.getItem('chat')).username

    this._socketURL = 'ws://vhost3.lnu.se:20080/socket/'
    this._socketKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
    this._type = 'message'
  }

  /**
   * Runs when the element is appended to a document-connected element
   *
   * @memberof ChatDisplay
   */
  connectedCallback () {
    this._socket = new window.WebSocket(this._socketURL)

    this._boundOnMessage = this._onMessage.bind(this)
    this._boundOnSendMessage = this._onSendMessage.bind(this)
    this._boundOnNameChange = this._onNameChange.bind(this)
    this._boundOnChannelChange = this._onChannelChange.bind(this)
    this._userMessage.setAttribute('chatchannel', 'all')

    this._socket.addEventListener('message', this._boundOnMessage)
    this._userMessage.addEventListener('sendmessage', this._boundOnSendMessage)
    this._changeName.addEventListener('click', this._boundOnNameChange)
    this._channelPicker.addEventListener('channelchange', this._boundOnChannelChange)
  }

  /**
   * Runs when the element is removed from a document-connected element
   *
   * @memberof ChatDisplay
   */
  disconnectedCallback () {
    this._socket.close()
    this._socket.removeEventListener('message', this._boundOnMessage)
    this._userMessage.removeEventListener('sendmessage', this._boundOnSendMessage)
    this._changeName.removeEventListener('click', this._boundOnNameChange)
  }

  /**
   * Creates a new chat-message when the chat receives a new
   * message from the websocket
   *
   * @param {Event} event An message Event
   * @memberof ChatDisplay
   */
  _onMessage (event) {
    const data = JSON.parse(event.data)
    if (data.username === 'The Server' && data.type === 'heartbeat') {
      return
    }

    if (data.username === 'The Server') {
      this._addMessage(data.username, data.data, true)
    } else if (this._channelName === '') {
      this._addMessage(data.username, data.data, false)
    } else if (data.channel === this._channelName) {
      this._addMessage(data.username, data.data, false)
    }
  }

  /**
   * Appends a new "chat-message" element to the messageContainer
   *
   * @param {String} name The username to the message
   * @param {String} message The message
   * @param {Boolean} serverMessage True if it was a server message
   * @memberof ChatDisplay
   */
  _addMessage (name, message, serverMessage) {
    const newMessage = document.createElement('chat-message')
    if (serverMessage) {
      newMessage.setAttribute('server', 'true')
    }

    newMessage.setAttribute('username', name)
    newMessage.setAttribute('message', message)
    this._messageContainer.appendChild(newMessage)
    this._messageContainer.scrollTop = this._messageContainer.scrollHeight
  }

  /**
   * Send a message to the websocket server
   *
   * @param {CustomEvent} event A Custom Event
   * @memberof ChatDisplay
   */
  _onSendMessage (event) {
    const sendmessage = {
      type: this._type,
      data: event.detail,
      username: this._userName,
      channel: this._channelName,
      key: this._socketKey
    }
    this._socket.send(JSON.stringify(sendmessage))
  }

  /**
  * Dispatches a Custom Event when the change name button is clicked
  *
  * @param {Event} event A click Event
  * @memberof ChatDisplay
  */
  _onNameChange (event) {
    this.dispatchEvent(new window.CustomEvent('changeName'))
  }

  /**
   * Changes the channel to what the user entered
   *
   * @param {CustomEvent} event A Custom Event
   * @memberof ChatDisplay
   */
  _onChannelChange (event) {
    if (event.detail.length > 0) {
      if (event.detail === 'all') {
        this._channelName = ''
      } else {
        this._channelName = event.detail
      }
    }
    this._userMessage.setAttribute('chatchannel', event.detail)
  }
}
window.customElements.define('chat-display', ChatDisplay)
