import React, { Component } from 'react'
import './index.css'
import PlayerCanvas from '../PlayerCanvas'
import ItemListing from '../ItemListing'
import EquippedItems from '../EquippedItems'
import CharacterProperties from '../CharacterProperties'
import _ from 'lodash'
import IntroModal from '../IntroModal'

class App extends Component {
  constructor(props) {
    super(props)

    let isOpen = (localStorage || {})['hideModal'] !== 'true'
    if (isOpen === '' || isOpen === undefined || isOpen === 'undefined')
      isOpen = true

    this.state = {
      selectedItems: JSON.parse((localStorage || [])['selectedItems'] || '{}'),
      action: 'stand1',
      emotion: 'default',
      skin: Number(localStorage['skin']) || 2000,
      isModalOpen: isOpen,
      mercEars: localStorage['mercEars'] == "true" || localStorage['mercEars'] === true
    }

    //this.updateBannerAdBlur()
  }

  /*updateBannerAdBlur() {
    const topAd = document.getElementById("top-banner-ad")
    topAd.className = this.state.isModalOpen ? "modal-blur" : "";
  }*/

  render() {
    const { selectedItems, action, emotion, skin, isModalOpen, mercEars } = this.state
    //this.updateBannerAdBlur()

    return (
      <div className={"App"}>
        <PlayerCanvas
          selectedItems={_.values(selectedItems).map(item => item.Id)}
          action={action}
          emotion={emotion}
          skin={skin}
          mercEars={mercEars} />


        <CharacterProperties
          equippedItems={selectedItems}
          action={action}
          emotion={emotion}
          skin={skin}
          mercEars={mercEars}
          onChangeAction={this.userChangedAction.bind(this)}
          onChangeEmotion={this.userChangedEmotion.bind(this)}
          onChangeSkin={this.userChangedSkin.bind(this)}
          onChangeMercEars={this.userChangedMercEars.bind(this)} />

      </div>
    )
  }

  setModalOpen (isModalOpen) {
    this.setState({ isModalOpen })
  }

  userChangedMercEars(mercEars) {
    this.setState({ mercEars });
    localStorage['mercEars'] = mercEars;
  }

  userChangedSkin (skin) {
    this.setState({ skin })
    localStorage['skin'] = skin
  }

  userChangedEmotion (emotion) {
    this.setState({ emotion })
    console.log('Changed emotion: ', emotion)
  }

  userChangedAction (action) {
    this.setState({ action })
    console.log('Changed action: ', action)
  }

  userSelectedItem (item) {
    let selectedItems = {
      ...this.state.selectedItems,
    }

    if (item.TypeInfo.SubCategory === 'Overall') {
      delete selectedItems['Top']
      delete selectedItems['Bottom']
    }

    if (item.similar) {
      item = { ...item }
      delete item['similar']
    }

    selectedItems[item.TypeInfo.SubCategory] = item
    this.updateItems(selectedItems)
  }

  userRemovedItem (item) {
    let selectedItems = {
      ...this.state.selectedItems,
    }
    delete selectedItems[item.TypeInfo.SubCategory]
    this.updateItems(selectedItems);
  }

  userRemovedItems () {
    let selectedItems = {}
    this.updateItems(selectedItems);
  }

  updateItems (selectedItems) {
    console.log('New Items: ', selectedItems)
    this.setState({
      selectedItems
    })

    localStorage['selectedItems'] = JSON.stringify(selectedItems)
  }
}

export default App
