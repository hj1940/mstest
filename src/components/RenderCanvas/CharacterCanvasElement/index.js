import React, { Component } from 'react'
import './index.css'
import Draggable, { DraggableCore } from 'react-draggable'
import { NotificationManager } from 'react-notifications'
import axios from 'axios'
import _ from 'lodash'

const region = !localStorage['region'] ? 'KMS' : localStorage['region']
const version = !localStorage['version'] ? '328' : localStorage['version']

class CharacterCanvasElement extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tryCount: 0
    }

    this.updateCharacterDetails(props, true)
  }

  componentDidUpdate(prevProps) {
    const ifChanged = ['skin', 'selectedItems', 'action', 'frame', 'mercEars', 'illiumEars', 'zoom', 'flipX']
    if (_.find(ifChanged, (property) => this.props.character[property] != prevProps.character[property])){
      this.updateCharacterDetails(this.props, false)
    }
  }

  updateCharacterDetails(props, isSync) {
    const { character } = props
    const itemsWithEmotion = _.values(character.selectedItems)
    .filter(item => item.id && (item.visible === undefined || item.visible))
    .map(item => {
      var itemEntry = item.id >= 20000 && item.id <= 29999 ? `${item.id}:${character.emotion}` : item.id
      return itemEntry
    });

    const { tryCount } = this.state

    let itemEntries = Object.values(character.selectedItems).filter(item => item.id && (item.visible === undefined || item.visible)).map(item => {
      let itemEntry = {
        itemId: Number(item.id),
        version: "328",
        region: "KMS"
      }

      if ((item.id >= 20000 && item.id < 30000) || (item.id >= 1010000 && item.id < 1020000)) itemEntry.animationName = character.emotion
      if (item.region && item.region.toLowerCase() != 'kms') itemEntry.region = item.region
      if (item.version && item.version.toLowerCase() != '328') itemEntry.version = item.version
      if (item.hue) itemEntry.hue = item.hue
      if (item.saturation != 1) itemEntry.saturation = item.saturation
      if (item.contrast != 1) itemEntry.contrast = item.contrast
      if (item.brightness != 1) itemEntry.brightness = item.brightness
      if (item.alpha != 1) itemEntry.alpha = item.alpha
      if (item.islot) itemEntry.islot = item.islot
      if (item.vslot) itemEntry.vslot = item.vslot

      return itemEntry
    })

    let backgroundColor = JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"}
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

    let itemEntriesPayload = JSON.stringify([
      ...itemEntries,
      { itemId: Number(character.skin), version: "210.1.1"},
      { itemId: Number(character.skin) + 10000, version: "210.1.1"}
    ])
    itemEntriesPayload = encodeURIComponent(itemEntriesPayload.substr(1, itemEntriesPayload.length - 2))

    const link = `https://maplestory.io/api/Character/${itemEntriesPayload}/${character.action}/${character.animating ? 'animated' : character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&showHighLefEars=${character.highFloraEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')

    if (isSync) {
      this.state.linkUsed = link
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data
          })
        }
      }.bind(this), this.showError.bind(this))
    } else this.setState({ linkUsed: link }, () => {
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data
          })
        }
      }.bind(this), this.showError.bind(this))
    })
  }

  render() {
    const { character, onUpdateRenderablePosition, onStart, onStop, onClick, selected } = this.props
    const { zoom } = character
    const { details } = this.state
    const styling = {
      transform: `translate(${character.position.x}px, ${character.position.y}px) translate(${details ? -0 : 0}px, ${details ? -0 : 0}px)`
    }

    const imgStyle = {
      position: 'relative',
      touchAction: 'none'
    }

/*IMG 1*/
    let itemEntries = Object.values(character.selectedItems).filter(item => item.id && (item.visible === undefined || item.visible)).map(item => {
      let itemEntry = {
        itemId: Number(item.id),
        version: "328",
        region: "KMS"
      }

      if ((item.id >= 20000 && item.id < 30000) || (item.id >= 1010000 && item.id < 1020000)) itemEntry.animationName = character.emotion
      if (item.region && item.region.toLowerCase() != 'kms') itemEntry.region = item.region
      if (item.version && item.version.toLowerCase() != '328') itemEntry.version = item.version
      if (item.hue) itemEntry.hue = item.hue
      if (item.saturation != 1) itemEntry.saturation = item.saturation
      if (item.contrast != 1) itemEntry.contrast = item.contrast
      if (item.brightness != 1) itemEntry.brightness = item.brightness
      if (item.alpha != 1) itemEntry.alpha = item.alpha
      if (item.islot) itemEntry.islot = item.islot
      if (item.vslot) itemEntry.vslot = item.vslot

      return itemEntry
    })

    let backgroundColor = JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"}
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

    let itemEntriesPayload = JSON.stringify([
      ...itemEntries,
      { itemId: Number(character.skin), version: "210.1.1" },
      { itemId: Number(character.skin) + 10000, version: "210.1.1"}
    ])
    itemEntriesPayload = encodeURIComponent(itemEntriesPayload.substr(1, itemEntriesPayload.length - 2))

    const link = `https://maplestory.io/api/Character/${itemEntriesPayload}/${character.action}/${character.animating ? 'animated' : character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&showHighLefEars=${character.highFloraEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')
/*//--IMG 1*/

/*IMG 2*/
    let itemEntriesT = Object.values(character.selectedItems).filter(item => item.id && (item.visible === undefined || item.visible)).map(item => {
      let itemEntry = {
        itemId: Number(item.id),
        version: "328",
        region: "KMS"
      }

      if ((item.id >= 20000 && item.id < 30000) || (item.id >= 1010000 && item.id < 1020000)) itemEntry.animationName = character.emotion
      if (item.region && item.region.toLowerCase() != 'kms') itemEntry.region = item.region
      if (item.version && item.version.toLowerCase() != '328') itemEntry.version = item.version
      if (item.hue) itemEntry.hue = item.hue
      if (item.saturation != 1) itemEntry.saturation = item.saturation
      if (item.contrast != 1) itemEntry.contrast = item.contrast
      if (item.brightness != 1) itemEntry.brightness = item.brightness
      if (item.alpha != 1) itemEntry.alpha = item.alpha
      if (item.islot) itemEntry.islot = item.islot
      if (item.vslot) itemEntry.vslot = item.vslot
      if ((item.id >= 30000 && item.id < 49999) || (item.id >= 1010000 && item.id < 1020000)) itemEntry.itemId = character.newHair
      //if ((item.id >= 20000 && item.id < 30000) || (item.id >= 1010000 && item.id < 1020000)) itemEntry.itemId = character.newFace

      return itemEntry
    })
//console.log(itemEntriesT);
    let backgroundColorT = JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"}
    const bgColorTextT = `${backgroundColorT.rgb.r},${backgroundColorT.rgb.g},${backgroundColorT.rgb.b},${backgroundColorT.rgb.a}`

    let itemEntriesPayloadT = JSON.stringify([
      ...itemEntriesT,
      { itemId: Number(character.skin), version: "210.1.1" },
      { itemId: Number(character.skin) + 10000, version: "210.1.1"}
    ])
    itemEntriesPayloadT = encodeURIComponent(itemEntriesPayloadT.substr(1, itemEntriesPayloadT.length - 2))

    const linkT = `https://maplestory.io/api/Character/${itemEntriesPayloadT}/${character.action}/${character.animating ? 'animated' : character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&showHighLefEars=${character.highFloraEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorTextT}` : '')

/*//--IMG 2*/

    return (
      <DraggableCore
        onStart={onStart}
        onStop={onStop}
        onDrag={onUpdateRenderablePosition}
        position={character.position}
        >
        <div className={selected ? 'selected-canvas-element' : ''} style={styling}>
         {
            details ? (<div><img
              src={link}
              alt=''
              className='renderable-instance'
              draggable={false}
              onClick={onClick}
              onError={this.showError.bind(this)}
              style={imgStyle}
              id='leftImg'
              crossorigin='anonymous'/>
              <img
                src={linkT}
                alt=''
                draggable={false}
                onClick={onClick}
                onError={this.showError.bind(this)}
                id='rightImg'
                crossorigin='anonymous'/>
              </div>
            ) : <div className='loading-character'>&nbsp;</div>
         }
        </div>
        </DraggableCore>
    )
  }

  showError() {
    setTimeout(function () {
      if (this.state.tryCount < 10) {
        setTimeout(function () {
          this.setState({ tryCount: this.state.tryCount + 1 }, () => {
            this.updateCharacterDetails(this.props)
          })
        }.bind(this), 1500)
      }
    }.bind(this), 3500)
  }
}

export default CharacterCanvasElement
