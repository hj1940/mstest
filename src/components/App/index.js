import React, { Component } from 'react'
import './index.css'
import ItemListing from '../ItemListing'
import EquippedItems from '../EquippedItems'
import _ from 'lodash'
import CharacterList from '../CharacterList'
import 'react-notifications/lib/notifications.css'
import {NotificationContainer, NotificationManager} from 'react-notifications'
import RenderCanvas from '../RenderCanvas'
import axios from 'axios'
import VirtualizedSelect from 'react-virtualized-select'

import createFilterOptions from 'react-select-fast-filter-options'
import Slider from 'rc-slider'
import RcTooltip from 'rc-tooltip'
import { SketchPicker } from 'react-color'
import Localization from '../../const/localize'
import Localize from '../../const/localize'
import { Tooltip } from 'react-tippy'
import FontAwesome from 'react-fontawesome'
import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'react-tippy/dist/tippy.css';
import Toggle from 'react-toggle'
import Sidebar from "react-sidebar";
const mql = window.matchMedia(`(min-width: 800px)`);


if (localStorage['initialized'] != '2') {
  localStorage['region'] = 'KMS'
  localStorage['version'] = '328'
  localStorage['initialized'] = '2'
}

if (!localStorage['language']) {
  if (navigator.language.startsWith('ko')) localStorage['language'] = 'kr'
  else if (navigator.language.startsWith('ja')) localStorage['language'] = 'jp'
  else if (navigator.language.startsWith('zh')) localStorage['language'] = 'ch'
  else if (navigator.language.startsWith('nl')) localStorage['language'] = 'nl'
  else if (navigator.language.startsWith('pt')) localStorage['language'] = 'br'
  else localStorage['language'] = 'en'
}

var creatingId = null
const throttledErrorNotification = _.throttle(NotificationManager.error.bind(NotificationManager), 1500, { leading:true })
let mapsIndexed = null
let versions = {
  GMS: [{region: "GMS", MapleVersionId: "latest", IsReady: true}],
  KMS: [{region: "KMS", MapleVersionId: "328", IsReady: true}],
  TMS: [{region: "TMS", MapleVersionId: "latest", IsReady: true}],
  CMS: [{region: "CMS", MapleVersionId: "latest", IsReady: true}],
  JMS: [{region: "JMS", MapleVersionId: "latest", IsReady: true}],
  SEA: [{region: "SEA", MapleVersionId: "latest", IsReady: true}]
}

function toCamel(o) {
  var newO, origKey, newKey, value
  if (o instanceof Array) {
    return o.map(function(value) {
        if (typeof value === "object") {
          value = toCamel(value)
        }
        return value
    })
  } else {
    newO = {}
    for (origKey in o) {
      if (o.hasOwnProperty(origKey)) {
        newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
        value = o[origKey]
        if (value instanceof Array || (value !== null && value.constructor === Object)) {
          value = toCamel(value)
        }
        newO[newKey] = value
      }
    }
  }
  return newO
}

let wzPromise = axios.get(`https://maplestory.io/api/wz?cache=false`)
.then(response => {
  let WZs = _.map(response.data.filter(wzEntry => wzEntry.isReady), wzEntry => {
    return {
      ...wzEntry,
      region: wzEntry.region
    }
  })
  versions = _.groupBy(WZs, 'region')

  let region = localStorage['region'], version = localStorage['version']

  if (!region || (version != '328' && _.findIndex(versions[region], ver => ver.mapleVersionId == version) == -1)) {
    localStorage['region'] = 'KMS'
    localStorage['version'] = '328'
    window.location.reload()
  }

  console.log(versions);
  return versions;
})

let maps = []
let mapsFilter = null
let mapPromise = axios.get(`https://maplestory.io/api/KMS/328/map`).then(response => {
      maps = _.map(response.data, map => {
        return {
          label: [map.streetName, map.name].join(' - '),
          value: map.id
        }
      });
      mapsFilter = createFilterOptions({options: maps})
    });

class App extends Component {
  constructor(props) {
    super(props)

    let isOpen = (localStorage || {})['hideModal'] !== 'true'
    if (isOpen === '' || isOpen === undefined || isOpen === 'undefined')
      isOpen = true

    // Try to recover any existing state
    this.state = {
      isModalOpen: isOpen,
      characters: JSON.parse(localStorage['characters'] || 'false') || [false],
      pets: JSON.parse(localStorage['pets'] || 'false') || [],
      selectedIndex: JSON.parse(localStorage['selectedIndex'] || 'false') || 0,
      selectedMap: JSON.parse(localStorage['selectedMap'] || 'false') || null,
      zoom: JSON.parse(localStorage['zoom'] || 'false') || 1,
      mapPosition: {x: 0, y: 0},
      backgroundColor: JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"},
      colorPickerOpen: false,
      language: localStorage['language'] == 'undefined' ? 'en' : localStorage['language'],
      music: false,
      region: localStorage['region'] ? localStorage['region'] : 'KMS',
      version: localStorage['version'] ? localStorage['version'] : '328',
      sidebarDocked: mql.matches,
      sidebarOpen: false,
      sidebarRDocked: mql.matches,
      sidebarROpen: false,
      versions
    }

    if (versions.KMS.length > 1)
      this.state.versions = versions
    else
      wzPromise.then(ver => this.setState({versions}))

    if (this.state.selectedIndex < 0) this.state.selectedIndex = false;
    this.state.focusRenderable = this.state.selectedIndex

    // If we have a legacy character, upgrade to latest now
    if (!_.isEmpty(this.state.selectedItems || {})) {
      const currentCharacter = {
        selectedItems: this.state.selectedItems,
        skin: this.state.skin || 2000
      }
      if (this.state.characters[0] === false)
        this.state.characters[0] = currentCharacter;
      else
        this.state.characters.push(currentCharacter)
    }

    // If we have no characters at all, gen a new shell
    if (this.state.characters[0] === false)
      this.state.characters[0] = this.getNewCharacter()

    delete localStorage['selectedItems'];
    delete localStorage['skin'];
    delete localStorage['frame'];
    delete localStorage['mercEars'];
    delete localStorage['illiumEars'];

    if (localStorage['currentCharacter']) {
      this.state = JSON.parse(localStorage['currentCharacter'])
      delete localStorage['currentCharacter']
      localStorage['characters'] = JSON.stringify([...this.state.characters, this.state])
      this.state['characters'] = [...this.state.characters, this.state]
    }

    this.state.characters.forEach((character, index) => {
      if (!character.id) character.id = Date.now() + (index + 1)
      character.type = 'character'
      character.action = character.action || 'stand1'
      character.frame = character.frame || 0
      character.zoom = character.zoom || 1
      character.emotion = character.emotion || 'default'
      character.newHair = ''
      character.newFace = ''
      character.skin = character.skin || 2000
      character.mercEars = character.mercEars || false
      character.illiumEars = character.illiumEars || false
      character.selectedItems = character.selectedItems || []
      character.visible = character.visible || false
      character.position = character.position || {x:0,y:0}
      character.flipX = character.flipX || false;
      character.name = character.name || '';
      character.includeBackground = character.includeBackground === undefined ? true : character.includeBackground
      let characterItems = _.values(toCamel(character.selectedItems)).map(item => {
        if (!item.region) item.region = localStorage['region']
        if (!item.version) item.version = localStorage['version']
        return item
      })
      character.selectedItems = _.keyBy(characterItems, (item) => item.typeInfo.subCategory)
      delete character.characters
      delete character.otherCharacters
      delete character.allCharacters
    })

    this.state.pets.forEach((pet, index) => {
      if (!pet.id) pet.id = Date.now() + (index + 1)
      pet.type = 'pet'
      pet.position = pet.position || { x: 0, y: 0}
      pet.summary = `https://maplestory.io/api/KMS/328/pet/${pet.petId}/${pet.animation || 'stand0'}/${pet.frame || 0}/${_.values(pet.selectedItems).map(item => item.id).join(',')}?resize=${pet.zoom || 1}`
    })

    if ((this.state.selectedIndex + 1) > (this.state.characters.length + this.state.pets.length) || !this.state.characters.length)
      this.state.selectedIndex = false;


    document.addEventListener("click", this.handleClick.bind(this))

    if (maps.length) this.state.mapsLoaded = true
    else mapPromise.then(() => setTimeout(() => this.setState({mapsLoaded : true}), 250))
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.onSetRightSidebarOpen = this.onSetRightSidebarOpen.bind(this);
    this.changEvent = this.changEvent.bind(this);
    this.changEventEye = this.changEventEye.bind(this);
  }

  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
  }

  componentWillUnmount() {
    mql.removeListener(this.mediaQueryChanged);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
    if(!this.state.sidebarDocked && this.state.sidebarOpen){
      this.setState({ sidebarOpen: false });
    }
  }

  onSetRightSidebarOpen(open) {
    this.setState({ sidebarROpen: open });
    if(!this.state.sidebarRDocked && this.state.sidebarROpen){
      this.setState({ sidebarROpen: false });
    }
  }

  mediaQueryChanged() {
    this.setState({ sidebarDocked: mql.matches, sidebarOpen: false, sidebarRDocked: mql.matches, sidebarROpen: false });
  }

  changeRegionVersion(region, version) {
    localStorage['region'] = region
    localStorage['version'] = version

    // Much easier than trying to reload everything here :D
    window.location.reload()
  }

  handleClick(e) {
    let element = e.target
    let found = false
    while (this.state.colorPickerOpen && !found && (element = element.parentElement) != null) {
      if (element.className != 'bg-color-picker-container') continue;
      else {
        found = true;
        console.log('found bg-color-picker-container')
      }
    }

    if (!found && this.state.colorPickerOpen) this.setState({ colorPickerOpen: false })
  }

  changEvent(e){
    this.state.characters[this.state.selectedIndex].newHair = e;
  }

  changEventEye(e){
    this.state.characters[this.state.selectedIndex].newFace = e;
  }

  render() {
    const {
      characters,
      pets,
      selectedIndex,
      isModalOpen,
      zoom,
      summary,
      selectedMap,
      focusRenderable,
      backgroundColor,
      colorPickerOpen,
      language,
      music
    } = this.state

    const localized = Localize.getLocalized(language)

    const bgColorText = `rgba(${backgroundColor.rgb.r}, ${backgroundColor.rgb.g}, ${backgroundColor.rgb.b}, ${backgroundColor.rgb.a})`

    const renderables = characters.concat(pets)

    return (
      <div className={"App"}>
      <div className="App-header">
          <span className='item-span' onClick={() => this.onSetSidebarOpen(true)}>&#9776;</span>
          <span className='item-span' onClick={() => this.onSetRightSidebarOpen(true)}>&#9881;</span>
        </div>
        <input type="hidden" id="rtLinkRl"/>
      { (selectedIndex !== false) ?
        <Sidebar
          sidebar={<ItemListing
            target={renderables[selectedIndex]}
            onItemSelected={this.userSelectedItem.bind(this)}
            localized={localized} />}
            open={this.state.sidebarOpen}
          docked={this.state.sidebarDocked}
          onSetOpen={this.onSetSidebarOpen}
          styles={{
           overlay: {
             zIndex: !this.state.sidebarDocked && this.state.sidebarOpen ? 3001 : 2000,
           },
           sidebar: {
             width: 300,
             zIndex: 4000,
             boxShadow: (this.state.sidebarDocked || !this.state.sidebarOpen) ? 'none' : 'rgba(0, 0, 0, 0.15) 2px 2px 2px;',
           },
           content: {
             top: 64,
           }
         }}></Sidebar> : '' }
         {
           (selectedIndex !== false && !_.isEmpty(renderables[selectedIndex].selectedItems) ?
           <Sidebar
             sidebar={<EquippedItems
               equippedItems={renderables[selectedIndex].selectedItems}
               selectedIndex={renderables[selectedIndex]}
               onRemoveItem={this.userRemovedItem.bind(this)}
               name={renderables[selectedIndex].name}
               skinId={renderables[selectedIndex].skin}
               onUpdateItem={this.updateItem.bind(this)}
               colorChage={this.changEvent}
               colorEyeChage={this.changEventEye}
               localized={localized}
               onRemoveItems={this.userRemovedItems.bind(this)} />}
               open={this.state.sidebarROpen}
             docked={this.state.sidebarRDocked}
             onSetOpen={this.onSetRightSidebarOpen}
             pullRight={true}
             shadow={false}
             styles={{
               overlay: {
                 zIndex: !this.state.sidebarRDocked && this.state.sidebarROpen ? 3001 : 2000,
               },
               sidebar: {
                 width: 300,
                 zIndex: 4000
               },
               content: {
                 top: 64,
               }
            }}></Sidebar> : '')
         }
        <RenderCanvas
          backgroundColor={bgColorText}
          zoom={zoom}
          mapId={selectedMap}
          renderables={renderables}
          selectedRenderable={selectedIndex}
          focusRenderable={focusRenderable === undefined ? selectedIndex : focusRenderable}
          onUpdateRenderable={this.updateRenderable.bind(this)}
          onClick={this.clickCanvas.bind(this)}
          localized={localized}
          onClickRenderable={this.userUpdateSelectedRenderable.bind(this)}/>

        <CharacterList
          renderables={renderables}
          selectedIndex={selectedIndex}
          onAddCharacter={this.addCharacter.bind(this)}
          onAddPet={this.addPet.bind(this)}
          onImportCharacter={this.importCharacter.bind(this)}
          onDeleteCharacter={this.removeCharacter.bind(this)}
          onCloneCharacter={this.cloneCharacter.bind(this)}
          onDeletePet={this.removePet.bind(this)}
          localized={localized}
          onUpdateSelectedCharacter={function (renderable) {
            this.userUpdateSelectedRenderable(renderable, () => {
              this.setState({
                focusRenderable: this.state.selectedIndex
              })
            })
          }.bind(this)}
          onUpdateCharacter={this.userUpdateCharacter.bind(this)}
          onUpdatePet={this.userUpdatePet.bind(this) }/>



        <NotificationContainer />
        { music ? <audio src={`//maplestory.io/api/KMS/328/map/${selectedMap}/bgm`} autoPlay={true} loop={true} /> : '' }
      </div>
    )
  }

  renderSettings() {
    const {
      characters,
      pets,
      selectedIndex,
      isModalOpen,
      zoom,
      summary,
      selectedMap,
      focusRenderable,
      backgroundColor,
      colorPickerOpen,
      language
    } = this.state

    const localized = Localize.getLocalized(language)

    const bgColorText = `rgba(${backgroundColor.rgb.r}, ${backgroundColor.rgb.g}, ${backgroundColor.rgb.b}, ${backgroundColor.rgb.a})`
    return (
      <div className='settings-container'>
        <label className='bg-color-picker-container' onClick={this.openColorPicker.bind(this)}>
        Background color
          <div className='bg-color-picker'>
            <div className='bg-color-grid' style={{ backgroundColor: bgColorText }}></div>
          </div>
          { colorPickerOpen ? <SketchPicker color={bgColorText} onChange={this.onChangeColor.bind(this)} /> : '' }
        </label>
        <label className='canvas-zoom'>
          <span>{localized.zoom}</span>
          <Slider
            value={zoom || 1}
            min={0.25}
            max={2}
            step={0.25}
            handle={handle}
            onChange={this.changeZoom.bind(this)} />
        </label>
        <label className='canvas-zoom'>
          <span>{localized.language}</span>
          <select value={this.state.language} onChange={this.changeLanguage.bind(this)}>
            <option value='en'>English</option>
            <option value='jp'>Japanese</option>
            <option value='kr'>Korean</option>
            <option value='ch'>Chinese (Traditional)</option>
            <option value='nl'>Dutch</option>
            <option value='br'>Portuguese (Brazil)</option>
          </select>
        </label>
        <div>
          <div className='map-select-container'>
            <VirtualizedSelect
              filterOptions={mapsFilter}
              isLoading={maps.length === 0}
              name='map-selection'
              searchable
              clearable
              simpleValue
              value={selectedMap}
              onChange={this.selectMap.bind(this)}
              options={maps}
              maxHeight={400}
              styles={{
                menuList: (styles, {data}) => {
                  return {
                    ...styles,
                    height: '400px'
                  }
                },
                menu: (styles, {data}) => {
                  return {
                    ...styles,
                    height: '400px'
                  }
                }
              }}
              />
          </div>
        </div>
        <label>
          <span>{localized.region}</span>
          <select value={this.state.region} onChange={(e) => this.changeRegionVersion(e.target.value, "328")}>
            { _.keys(this.state.versions).map(versionName => <option value={versionName} key={versionName}>{versionName}</option>) }
          </select>
        </label>
        <label>
          <span>{localized.version}</span>
          <select value={this.state.version} onChange={(e) => this.changeRegionVersion(this.state.region, e.target.value)}>
            { this.state.versions[this.state.region].map(({mapleVersionId}) => <option value={mapleVersionId} key={mapleVersionId}>{mapleVersionId}</option>) }
            <option value='328' key='328'>328</option>
          </select>
        </label>
        <label>
          <span>{localized.playMusic}</span>
          <Toggle
            onChange={this.toggleMusic.bind(this)}
            checked={this.state.music} />
        </label>
        <label>
          <a href='#' onClick={this.exportAllCharacters.bind(this)}>Export All Characters</a>
        </label>
      </div>
    )
  }

  toggleMusic(e) {
    this.setState({
      music: !this.state.music
    })
  }

  exportAllCharacters() {
    this.state.characters.forEach(character => {
      const a = document.createElement('a')
      a.style = 'display: none;'
      document.body.appendChild(a)

      const payload = JSON.stringify(character, null, 2),
        blob = new Blob([payload], {type: 'octet/stream'}),
        url = window.URL.createObjectURL(blob)
      a.href = url
      if (character.name)
        a.download = character.name + '-data.json'
      else
        a.download = 'character-data.json'
      a.click()

      window.URL.revokeObjectURL(url)
      a.remove()
    })
  }

  changeLanguage(e) {
    this.setState({
      language: e.target.value
    })
    localStorage['language'] = e.target.value
  }

  changeZoom(newZoom) {
    this.setState({ zoom: newZoom })
    localStorage['zoom'] = newZoom
  }

  selectMap(mapId) {
    this.setState({
      selectedMap: mapId
    })
    localStorage['selectedMap'] = mapId
  }

  updateRenderable(renderable, newProps) {
    if (renderable.type == 'pet') this.userUpdatePet(renderable, newProps)
    if (renderable.type == 'character' || renderable.type === undefined) this.userUpdateCharacter(renderable, newProps)
  }

  clickCanvas(e) {
    if (e.target === e.currentTarget && (this.state.characters.length + this.state.pets.length) > 1) {
      this.setState({ selectedIndex: false })
      localStorage['selectedIndex'] = 'false'
    }
  }

  addPet() {
    var pets = [...(this.state.pets || []), this.getNewPet()]
    this.setState({pets, selectedIndex: this.state.characters.length + this.state.pets.length})
    localStorage['pets'] = JSON.stringify(pets)
  }

  removePet(pet) {
    var pets = this.state.pets.filter(c => c != pet)
    this.setState({ pets, selectedIndex: false, zoom: 1 }) // Unselect any pet in case we delete the last pet
    localStorage['pets'] = JSON.stringify(pets)
    localStorage['selectedIndex'] = false
    localStorage['zoom'] = 1
  }

  getNewPet() {
    const andysFavePetIds = [5000000, 5000001, 5000002, 5000003, 5000004, 5000005]
    const petId = andysFavePetIds[Math.floor(Math.random() * andysFavePetIds.length)]
    return {
      petId,
      selectedItems: [],
      id: Date.now(),
      type: 'pet',
      summary: `https://maplestory.io/api/KMS/328/pet/${petId}/stand0`,
      animation: 'stand0',
      visible: true,
      frame: 0,
      zoom: 1,
      fhSnap: true,
      position: { x:0, y:0 }
    }
  }

  importCharacter(e) {
    let target = e.target
    let importAll = Array.prototype.map.call(target.files, file => {
      return new Promise((res, rej) => {
        let extension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase()
        if (extension != 'json') {
          console.warn('Not valid JSON file')
          return
        }

        let reader = new FileReader()
        reader.onload = function (ev) {
          let payload = ev.target.result
          let data = JSON.parse(payload)

          res()
          if (!data.id || data.type != 'character' || !data.selectedItems) return

          data.id = Date.now()

          let characters = [
            ...this.state.characters,
            data
          ]
          this.setState({
            characters,
            selectedIndex: this.state.characters.length
          })
          localStorage['characters'] = JSON.stringify(characters)
        }.bind(this)

        reader.readAsText(file, 'UTF8')
      })
    })

    Promise.all(importAll).then(() => {
      target.value = ''
    })
  }

  addCharacter() {
    var characters = [ ...this.state.characters, this.getNewCharacter() ]
    this.setState({ characters, selectedIndex: this.state.characters.length })
    localStorage['characters'] = JSON.stringify(characters)
  }

  removeCharacter(character) {
    var characters = this.state.characters.filter(c => c != character)
    this.setState({ characters, selectedIndex: false, zoom: 1 }) // Unselect any character in case we delete the last character
    localStorage['characters'] = JSON.stringify(characters)
    localStorage['selectedIndex'] = false
    localStorage['zoom'] = 1
  }

  cloneCharacter(character) {
    let characters = [
      ...this.state.characters
    ]

    let indexOfCharacter = characters.indexOf(character)
    characters.splice(indexOfCharacter + 1, 0, {
      ...character,
      id: Date.now(),
      position: {
        x: character.position.x + 100,
        y: character.position.y
      }
    })
    let newCharacterIndex = indexOfCharacter + 1

    this.setState({ characters, selectedIndex: newCharacterIndex, focusRenderable: newCharacterIndex + 1 })
    localStorage['selectedIndex'] = newCharacterIndex
    localStorage['characters'] = JSON.stringify(characters)
  }

  userUpdateSelectedRenderable(renderable, callback) {
    let selectedIndex = this.state.characters.indexOf(renderable)
    if (selectedIndex == -1) {
      selectedIndex = this.state.pets.indexOf(renderable)
      if (selectedIndex != -1) selectedIndex += this.state.characters.length
    }
    this.setState({
      selectedIndex,
      zoom: 1
    }, callback)
    localStorage['selectedIndex'] = selectedIndex
    localStorage['zoom'] = 1
  }

  userUpdatePet(pet, newProps) {
    if (pet.locked === true && newProps.locked === undefined) {
      throttledErrorNotification('Pet is locked and can not be modified', '', 1000)
      return;
    }

    const pets = [...this.state.pets]
    const petIndex = pets.indexOf(pet)

    const currentPet = pets[petIndex] = {
      ...pet,
      ...newProps
    }

    currentPet.summary = `https://maplestory.io/api/KMS/328/pet/${currentPet.petId}/${currentPet.animation || 'stand0'}/${currentPet.frame || 0}/${_.values(currentPet.selectedItems).map(item => item.id).join(',')}?resize=${currentPet.zoom || 1}`

    this.setState({
        pets: pets
    })
    localStorage['pets'] = JSON.stringify(pets)
  }

  userUpdateCharacter(character, newProps) {
    if (character.locked === true && newProps.locked === undefined) {
      throttledErrorNotification('Character is locked and can not be modified', '', 1000)
      return;
    }

    const characters = [...this.state.characters]
    const characterIndex = characters.indexOf(character)

    const currentCharacter = characters[characterIndex] = {
      ...character,
      ...newProps
    }

    const itemsWithEmotion = _.values(currentCharacter.selectedItems)
      .filter(item => item.id && (item.visible === undefined || item.visible))
      .map(item => {
        var itemEntry = item.id >= 20000 && item.id <= 29999 ? `${item.id}:${currentCharacter.emotion}` : item.id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });

    const { backgroundColor } = this.state
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

    this.setState({
        characters: characters
    })
    localStorage['characters'] = JSON.stringify(characters)
  }

  getNewCharacter() {
    return {
      id: Date.now(),
      type: 'character',
      action: 'stand1',
      emotion: 'default',
      skin: 2000,
      zoom: 1,
      frame: 0,
      mercEars: false,
      illiumEars: false,
      selectedItems: [],
      visible: true,
      position: {x: 0, y: 0},
      fhSnap: true
    }
  }

  updateSelectedRenderable(props) {
    if (this.state.selectedIndex+1 > this.state.characters.length)
      this.userUpdatePet(this.state.pets[this.state.selectedIndex - this.state.characters.length], props)
    else
      this.userUpdateCharacter(this.state.characters[this.state.selectedIndex], props)
  }

  setModalOpen (isModalOpen) {
    this.setState({ isModalOpen })
  }

  userSelectedItem (item) {
    let selectedRenderable = null
    if (this.state.selectedIndex+1 > this.state.characters.length) selectedRenderable = this.state.pets[this.state.selectedIndex - this.state.characters.length]
    else selectedRenderable = this.state.characters[this.state.selectedIndex]

    item.region = localStorage['region']
    item.version = localStorage['version']

    let selectedItems = {
      ...selectedRenderable.selectedItems,
    }

    if (item.typeInfo) {
      if (item.typeInfo.subCategory === 'Overall') {
        delete selectedItems['Top']
        delete selectedItems['Bottom']
      }
    }

    if (item.similar) {
      item = { ...item }
      delete item['similar']
    }

    if (item.typeInfo) {
      selectedItems[item.typeInfo.subCategory] = item
    }
    this.updateItems(selectedItems)
  }

  userRemovedItem (item) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedIndex].selectedItems,
    }
    delete selectedItems[item.typeInfo.subCategory]
    this.updateItems(selectedItems);
  }

  userRemovedItems () {
    let selectedItems = {}
    this.updateItems(selectedItems);
  }

  updateItem (item, newProps) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedIndex].selectedItems,
    }
    selectedItems[item.typeInfo.subCategory] = {
      ...item,
      ...newProps
    }
    this.updateItems(selectedItems);
  }

  updateItems (selectedItems) {
    console.log('New Items: ', selectedItems)
    this.updateSelectedRenderable({
      selectedItems
    })
  }

  onChangeColor(backgroundColor, event) {
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

    const characters = this.state.characters.map((character, index) => {
      const itemsWithEmotion = _.values(character.selectedItems)
      .filter(item => item.id && (item.visible === undefined || item.visible))
      .map(item => {
        var itemEntry = item.id >= 20000 && item.id <= 29999 ? `${item.id}:${character.emotion}` : item.id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });

      return {
        ...character
      }
    });

    this.setState({ backgroundColor, characters })
    localStorage['backgroundColor'] = JSON.stringify(backgroundColor)
  }

  openColorPicker() {
    this.setState({ colorPickerOpen: true })
  }
}

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <RcTooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      style={{border: "solid 2px hsl("+value+", 53%, 53%)"}}
      key={index}
    >
      <Handle value={value} {...restProps} />
    </RcTooltip>
  );
};

export default App
