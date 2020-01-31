import React, { Component } from 'react'
import './index.css'
import axios from 'axios'
import _ from 'lodash'
import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry,
  AutoSizer
} from 'react-virtualized';

// Black list for individual sub categories
const blacklistSubcategories = [
  "Monster Battle",
  "Skill Effect",
  "Pet Use",
  "Test Armor",
  "Test Weapon",
  "Shovel",
  "Pickaxe",
  "Totem"
]

// White list for categories
const applicableCategories = {
  character: ['Character', 'Armor', 'Accessory', 'Mount', 'One-Handed Weapon', 'Two-Handed Weapon'],
  pet: ['Other']
}

// White list for individual sub categories
const applicableSubcategories = { pet: ['Pet Equipment'] }

let cellMeasurerCache = null

const region = !localStorage['region'] ? 'KMS' : localStorage['region']
const version = !localStorage['version'] ? '328' : localStorage['version']

const itemListPromise = axios.get(`https://maplestory.io/api/KMS/328/item/category/equip`);
const chairListPromise = axios.get(`https://maplestory.io/api/KMS/328/item/category/setup`);

class ItemListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      categories: {},
      categoryNames: {},
      selectedCategory: null,
      search: '',
      gutterSize: 6,
      columnWidth: 32,
      categoryNameSelected: '',
      selectedGender: '',
      cashItemsOnly: false,
      similarItems: null
    }

    this._cache = cellMeasurerCache = new CellMeasurerCache({
      defaultHeight: 32,
      defaultWidth: 32,
      fixedWidth: true,
      fixedHeight: true
    });

    Promise.all([itemListPromise, chairListPromise]).then(responses => {
      if(!_.every(responses, res => res.status === 200)) return;
      const setupData = responses[1].data
      const chairData = setupData.filter(item => Math.floor(item.id / 10000) === 301).map(chair => {
        chair.typeInfo.category = "Character" // That way it shows up as part of the character section
        return chair
      })
      const itemData = (responses[0].data || []) || []
      const groupedHair = _.map(
        _.groupBy(
          itemData.filter(item => item.id >= 30000 && item.id <= 60000),
          item => Math.floor(item.id / 10)
        ), itemGrouping => {
          const firstItem = itemGrouping[0]
          firstItem.similar = itemGrouping
          return firstItem
        }
      )
      const groupedFaces = _.map(
        _.groupBy(
          itemData.filter(item => item.id >= 10000 && item.id < 30000),
          item => (item.id % 100) + (item.id - (item.id % 1000))
        ), itemGrouping => {
          const firstItem = itemGrouping[0]
          firstItem.similar = itemGrouping
          return firstItem
        }
      )
      const categories = _.mapValues(
        _.groupBy(
          itemData
            .filter(item => item.id < 10000 || item.id > 50000)
            .concat(groupedHair)
            .concat(groupedFaces)
            .concat(chairData),
          item => item.typeInfo.category),
        items => _.groupBy(items, item => item.typeInfo.subCategory)
      );

      const categoryNames = _.mapValues(categories, _.keys);
      const categoryNamesKeys = _.keys(categoryNames).filter((categoryName) => categoryName != 'Character');
      categoryNamesKeys.unshift('Character');

      this.setState({
        items: itemData,
        categories,
        categoryNames,
        categoryNamesKeys
      })
    })
  }

  render() {
    const { categoryNames, categoryNamesKeys, selectedCategory, items, categoryNameSelected, cashItemsOnly, selectedGender, similarItems } = this.state
    const search = this.state.search.toLowerCase()
    const { localized } = this.props

    if (search) console.log(`Searching for ${search}`)

    const selectedType = this.props.target.type || 'character'
    const applicableItems = (items || []).filter(item => {
      return applicableCategories[selectedType].indexOf(item.typeInfo.category) !== -1 && blacklistSubcategories.indexOf(item.typeInfo.subCategory) === -1 && (!applicableSubcategories[selectedType] || applicableSubcategories[selectedType].indexOf(item.typeInfo.subCategory) !== -1)
    })

    this.showIcons = !search ? (selectedCategory || applicableItems) : applicableItems.filter((item, i) => {
      return (item.name || '').toLowerCase().indexOf(search) !== -1 ||
        item.id.toString().toLowerCase().indexOf(search) !== -1 ||
        (item.desc || '').toLowerCase().indexOf(search) !== -1
    })

    if (cashItemsOnly)
      this.showIcons = this.showIcons.filter(item => item.isCash)

    if (selectedGender)
      this.showIcons = this.showIcons.filter(c => c.requiredGender == selectedGender);

    this.showIcons = this.showIcons.filter(item => item && item.id)

    return (
      <div className='item-listing'>
        <div className='item-listing-header'>
          <input type="search" value={search} onChange={this.search.bind(this)} placeholder="Search.." className="item-search"/>

        </div>
        <div className='filters'>
          <label>
            <input type="checkbox" onChange={this.toggleCashItems.bind(this)} checked={this.cashItemsOnly} />
            {localized.isCashFilter}
          </label>
          <select onChange={this.changeGender.bind(this)} value={this.selectedGender} className="gender-select">
            <option value="">{localized.genderFilter}</option>
            <option value="0">{localized.male}</option>
            <option value="1">{localized.female}</option>
            <option value="2">{localized.universal}</option>
          </select>
        </div>
        <div className='item-listing-content'>
          <div className='item-listing-categories'>
          <ul>
          {
            _.map((categoryNamesKeys || []).filter(categoryName => applicableCategories[selectedType].indexOf(categoryName) !== -1), category => {
              const subCategories = categoryNames[category];
              return (<li key={category} onClick={this.selectPrimaryCategory.bind(this, category)}>
              <span className={'category' + (category === categoryNameSelected ? ' active' : '')}>
              {
                (category === "Character")
                ? (<span>{localized.charactor}</span>)
                : (<span></span>)
              }
              {
                (category === "Armor")
                ? (<span>{localized.armor}</span>)
                : (<span></span>)
              }
              {
                (category === "Accessory")
                ? (<span>{localized.accessory}</span>)
                : (<span></span>)
              }
              {
                (category === "Mount")
                ? (<span>{localized.mount}</span>)
                : (<span></span>)
              }
              {
                (category === "One-Handed Weapon")
                ? (<span>{localized.oneHandedWeapon}</span>)
                : (<span></span>)
              }
              {
                (category === "Two-Handed Weapon")
                ? (<span>{localized.twoHandedWeapon}</span>)
                : (<span></span>)
              }
              </span>
              <ul>
                {
                  subCategories.filter(categoryName => blacklistSubcategories.indexOf(categoryName) === -1 && (!applicableSubcategories[selectedType] || applicableSubcategories[selectedType].indexOf(categoryName) !== -1)).map(subCategory => <li
                    key={subCategory}
                    className={subCategory === categoryNameSelected ? 'active' : ''}
                    onClick={this.selectChildCategory.bind(this, category, subCategory)}>
                    {
                      (subCategory === "Hair")
                      ? (<span>{localized.hair}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Face")
                      ? (<span>{localized.face}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Chair")
                      ? (<span>{localized.chair}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Face Accessory")
                      ? (<span>{localized.faceAccessory}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Eye Decoration")
                      ? (<span>{localized.eyeDecoration}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Earrings")
                      ? (<span>{localized.earrings}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Pendant")
                      ? (<span>{localized.pendant}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Belt")
                      ? (<span>{localized.belts}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Medal")
                      ? (<span>{localized.medal}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Shoulder Accessory")
                      ? (<span>{localized.shoulderAccessory}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Pocket Item")
                      ? (<span>{localized.pocketItem}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Badge")
                      ? (<span>{localized.badge}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Emblem")
                      ? (<span>{localized.emblem}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Ring")
                      ? (<span>{localized.ring}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Hat")
                      ? (<span>{localized.hat}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Cape")
                      ? (<span>{localized.cape}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Top")
                      ? (<span>{localized.top}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Glove")
                      ? (<span>{localized.glove}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Overall")
                      ? (<span>{localized.overall}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Bottom")
                      ? (<span>{localized.bottom}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Shield")
                      ? (<span>{localized.shield}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Shoes")
                      ? (<span>{localized.shoes}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Mount")
                      ? (<span>{localized.mount}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Shining Rod")
                      ? (<span>{localized.shiningRod}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Soul Shooter")
                      ? (<span>{localized.soulShooter}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Desperado")
                      ? (<span>{localized.desperado}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Whip Blade")
                      ? (<span>{localized.whipBlade}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Psy-limiter")
                      ? (<span>{localized.psyLimiter}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Chain")
                      ? (<span>{localized.chain}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Gauntlet")
                      ? (<span>{localized.gauntlet}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "One-Handed Sword")
                      ? (<span>{localized.oneHandedSword}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "One-Handed Axe")
                      ? (<span>{localized.oneHandedAxe}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "One-Handed Blunt Weapon")
                      ? (<span>{localized.oneHandedBluntWeapon}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Dagger")
                      ? (<span>{localized.dagger}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Katara")
                      ? (<span>{localized.katara}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Cane")
                      ? (<span>{localized.cane}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Wand")
                      ? (<span>{localized.wand}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Staff")
                      ? (<span>{localized.staff}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Cash")
                      ? (<span>{localized.cash}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Two-Handed Sword")
                      ? (<span>{localized.twoHandedSword}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Two-Handed Axe")
                      ? (<span>{localized.twoHandedAxe}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Two-Handed Blunt")
                      ? (<span>{localized.twoHandedBlunt}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Spear")
                      ? (<span>{localized.spear}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Pole Arm")
                      ? (<span>{localized.poleArm}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Bow")
                      ? (<span>{localized.bow}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Crossbow")
                      ? (<span>{localized.crossbow}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Claw")
                      ? (<span>{localized.claw}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Knuckle")
                      ? (<span>{localized.knuckle}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Gun")
                      ? (<span>{localized.gun}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Dual Bowgun")
                      ? (<span>{localized.dualBowgun}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Hand Cannon")
                      ? (<span>{localized.handCannon}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Lapis")
                      ? (<span>{localized.lapis}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Lazuli")
                      ? (<span>{localized.lazuli}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Arm Cannon")
                      ? (<span>{localized.armCannon}</span>)
                      : (<span></span>)
                    }
                    {
                      (subCategory === "Ancient Bow")
                      ? (<span>{localized.ancientBow}</span>)
                      : (<span></span>)
                    }
                    </li>)
                }
              </ul></li>)
            })
          }
          </ul>
          </div>
          <div className='item-listing-icons'>
          
            { this._renderAutoSizer({ height: 32 }) }
          </div>
        </div>
      </div>
    )
  }

  onSimilarScroll(e) {
    var masonry = document.getElementsByClassName("ReactVirtualized__Masonry")[0]
    masonry.scrollTop += e.deltaY
    this.mouseOutSimilar()
  }

  mouseOutSimilar() {
    this.setState({ similarItems: null })
  }

  toggleCashItems (e) {
    this.setState({ cashItemsOnly: e.target.checked })
  }

  changeGender (e) {
    this.setState({ selectedGender: e.target.value })
  }

  _renderAutoSizer ({ height }) {
    this._height = height || 32

    return (
      <AutoSizer
        onResize={this._onResize.bind(this)}
      >
        {this._renderMasonry.bind(this)}
      </AutoSizer>
    )
  }

  _renderMasonry({ height, width }) {
    this._width = width
    this._height = height

    this._calculateColumnCount()
    this._initCellPositioner()

    return <Masonry
      cellCount={this.showIcons.length - 1}
      cellMeasurerCache={cellMeasurerCache}
      cellPositioner={this._cellPositioner}
      cellRenderer={this.cellRenderer.bind(this)}
      ref={this._setMasonryRef.bind(this)}
      width={width}
      height={this._height}
      />
  }

  _calculateColumnCount () {
    const {
      columnWidth,
      gutterSize
    } = this.state

    this._columnCount = Math.floor(this._width / (columnWidth + gutterSize))
  }

  _initCellPositioner () {
    if (typeof this._cellPositioner === 'undefined') {
      const {
        columnWidth,
        gutterSize
      } = this.state

      this._cellPositioner = createMasonryCellPositioner({
        cellMeasurerCache: this._cache,
        columnCount: this._columnCount,
        columnWidth,
        spacer: gutterSize
      })
    }
  }

  _onResize ({ height, width }) {
    this._width = width

    this._columnHeights = {}
    this._calculateColumnCount()
    this._resetCellPositioner()
    this._masonry.recomputeCellPositions()
  }

  _resetCellPositioner () {
    const {
      columnWidth,
      gutterSize
    } = this.state

    this._cellPositioner.reset({
      columnCount: this._columnCount,
      columnWidth,
      spacer: gutterSize
    })
  }

  _setMasonryRef (ref) {
    this._masonry = ref
  }

  cellRenderer ({ index, key, parent, style }) {
    const item = this.showIcons[index]
    const { showSimilarTo } = this.state

    if (!item) return

    return (
      <CellMeasurer
        cache={cellMeasurerCache}
        index={index}
        key={item.id}
        parent={parent}
      >
        <div className="item-img-container" style={{
          ...style,
          width: 32,
          height: 32
        }}>
          { this.itemIcon(item, this.state.search) }
        </div>
      </CellMeasurer>
    )
  }

  containedItemIcon(item, hideSimilar) {
    return (
      <div
        onWheel={!hideSimilar ? this.onSimilarScroll.bind(this) : false}
        >
        { this.itemIcon(item, hideSimilar) }
      </div>
    )
  }

  itemIcon(item, hideSimilar) {
    return (<img
      src={`https://maplestory.io/api/KMS/328/item/${item.id}/icon`}
      onClick={this.selectItem.bind(this, item)}
      alt={item.name}
      title={item.name}
      id={item.id}
      key={item.id}
      onMouseOver={!hideSimilar && item.similar ? this.showSimilar.bind(this, item) : false} />)
  }

  showSimilar(item) {
    const iconImg = document.getElementById(item.id).parentElement
    const masonryContainer = document.getElementsByClassName("ReactVirtualized__Masonry")[0]
    this.setState({
      similarItems: {
        item,
        x: iconImg.offsetLeft + masonryContainer.offsetLeft,
        y: iconImg.offsetTop + masonryContainer.offsetTop - iconImg.parentElement.parentElement.scrollTop
      }
    })
  }

  search(e) {
    this.setState({
      search: e.target.value
    })
  }

  selectPrimaryCategory(primaryCategory, proxy, e) {
    const selectedCategory = _.flatMap(_.values(this.state.categories[primaryCategory], a => a))
    this.selectCategory(selectedCategory, primaryCategory)
    proxy.preventDefault()
    proxy.stopPropagation()
  }

  selectChildCategory(primaryCategory, childCategory, proxy, e) {
    const selectedCategory = this.state.categories[primaryCategory][childCategory]
    this.selectCategory(selectedCategory, childCategory)
    proxy.preventDefault()
    proxy.stopPropagation()
  }

  selectCategory(selectedCategory, categoryNameSelected) {
    console.log(`Selected category: ${categoryNameSelected}`)
    this.setState({
      selectedCategory,
      categoryNameSelected,
      search: ''
    })
  }

  selectItem(item){
    this.props.onItemSelected(item)
  }
}

export default ItemListing
