import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'
import axios from 'axios'

class CharacterProperties extends Component {
  constructor(props) {
    super(props)
    this.state = {
      actions: ['stand1', 'stand2'],
      emotions: [
        'angry',
        'bewildered',
        'blaze',
        'blink',
        'bowing',
        'cheers',
        'chu',
        'cry',
        'dam',
        'default',
        'despair',
        'glitter',
        'hit',
        'hot',
        'hum',
        'love',
        'oops',
        'pain',
        'qBlue',
        'shine',
        'smile',
        'stunned',
        'troubled',
        'vomit',
        'wink'
      ]
    }

    // Populate true action list
    axios.get(`https://maplestory.io/api/KMS/328/character/actions/1040004`)
      .then(response => this.setState({actions: _.sortBy(response.data, a => a)}))
  }

  componentDidUpdate(prevProps) {
    if (prevProps.equippedItems === this.props.equippedItems) return
    const { equippedItems } = this.props

    const itemIds = _.values(equippedItems).map(item => item.Id)
    axios.get(`https://maplestory.io/api/KMS/328/character/actions/${itemIds.join(',')}`)
      .then(response => this.setState({actions: _.sortBy(response.data, a => a)}))
  }

  render() {
    const { actions, emotions } = this.state
    const { equippedItems, emotion, action, skin, mercEars } = this.props

    return (
      <div className='character-properties'>
        <div className="facial-expression">
          <span>표정</span>
          <select disabled={!equippedItems.Face} onChange={this.changeEmotion.bind(this)} value={emotion}>
            {
              emotions.map(e => (
                <option value={e} key={e}>{e}</option>
              ))
            }
          </select>
        </div>
        <div className="action">
          <span>포즈</span>
          <select onChange={this.changeAction.bind(this)} value={action}>
            {
              actions.map(a => (
                <option value={a} key={a}>{a}</option>
              ))
            }
          </select>
        </div>
        <div className="skin">
          <span>피부</span>
          <select onChange={this.changeSkin.bind(this)} value={skin}>
            <option value='2000'>크림 피부</option>
            <option value='2004'>스산 피부</option>
            <option value='2010'>노블레스 피부</option>
            <option value='2001'>태닝 피부</option>
            <option value='2003'>밀키 피부</option>
            <option value='2009'>창백 피부</option>
            <option value='2013'>데모닉 피부</option>
            <option value='2002'>헬시 피부</option>
            <option value='2011'>고져스 피부</option>
            <option value='2012'>엘프 피부</option>
            <option value='2015'>뽀송 꽃잎 피부</option>
            <option value='2016'>홍조 꽃잎 피부</option>
          </select>
        </div>
      </div>
    )
  }

  changeSkin(e) {
    this.props.onChangeSkin(e.target.value)
  }

  changeEmotion(e) {
    this.props.onChangeEmotion(e.target.value)
  }

  changeAction (e) {
    this.props.onChangeAction(e.target.value)
  }

  changeMercEars(e) {
    this.props.onChangeMercEars(e.target.checked);
  }
}

export default CharacterProperties
