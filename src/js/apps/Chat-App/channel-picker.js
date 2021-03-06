/**
 * Module for ChannelPicker
 *
 * @module src/js/apps/Chat-App/channel-picker
 * @author Viktor Ödman
 * @version 1.0.0
*/

const template = document.createElement('template')
template.innerHTML = `
    <style>
     .channel {
      text-align: center;
    }
      input[type="text"] {
        font-size: 16px;
        background-color: #111111;
        color: #7FDBFF;
        outline: none;
        border: none;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        box-sizing: border-box;
        text-align: center;
    }
    input[type="text"]::placeholder {
        color: #7FDBFF;
        opacity: 1;
        font-style: oblique;
    }
    </style>
    <div class="channel">
      <input class="channelName" type="text" placeholder="Pick A Channel">
    </div>
`
/**
 * Represents a Channel Picker
 *
 * @class ChannelPicker
 * @extends {window.HTMLElement}
 */
class ChannelPicker extends window.HTMLElement {
  /**
   * Creates an instance of ChannelPicker.
   * @memberof ChannelPicker
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this._channelName = this.shadowRoot.querySelector('.channelName')
  }

  /**
   * Runs when the element is appended to a document-connected element
   *
   * @memberof ChannelPicker
   */
  connectedCallback () {
    this._boundOnEnter = this._onEnter.bind(this)

    this._channelName.addEventListener('keydown', this._boundOnEnter)
  }

  /**
   * Handles keydown events. Dispatches a "channelchange"
   * event when user clicks enter.
   *
   * @param {CustomEvent} event A "channelchange" event
   * @memberof ChannelPicker
   */
  _onEnter (event) {
    if (event.code !== 'Enter') {
      return
    }
    const channel = this._channelName.value
    this._channelName.value = ''
    this.dispatchEvent(new window.CustomEvent('channelchange', { detail: channel }))
  }
}

window.customElements.define('channel-picker', ChannelPicker)
