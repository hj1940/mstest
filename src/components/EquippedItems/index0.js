import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'

import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'react-tippy/dist/tippy.css';
import RcTooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import { Tooltip } from 'react-tippy'
import Toggle from 'react-toggle'
import mergeImages from 'merge-images';

class EquippedItems extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rtMixId : '',
      ltMixId : ''
    }
  }
  selected(item){

    item.textContent = "∨";
    item.classList.add("select");
  }

  unselected(item){
    item.textContent = "";
    item.classList.remove("select");
  }

  resettingValues(){
    const slider = document.getElementById("slider");
    const baseColorValue = document.getElementById("baseColorValue");
    const mixColorValue = document.getElementById("mixColorValue");
    const rtImg = document.getElementById("rightImage");

    slider.value = 50;
    mixColorValue.textContent = "50%";
    baseColorValue.textContent = "50%";
    rtImg.style.opacity = ".5";
  }

  chgColor(e){
    const ltColor = document.getElementsByClassName("lt");
    const rtColor = document.getElementsByClassName("rt");
    const itemId = document.getElementById("itemId").value;
    const rtImg = document.getElementById("rightImage");
    const ltImg = document.getElementById("leftImage");
    const canvasLt = document.getElementById("leftImg").src;
    const canvasRt = document.getElementById("rightImg").src;

    for(let i=0; i<8; i++){
      if(ltColor[i].classList.contains("select") && ltColor[i] != e.target && e.target.classList.contains("lt")){
        this.unselected(ltColor[i]);
      }
      if(rtColor[i].classList.contains("select") && rtColor[i] != e.target && e.target.classList.contains("rt")){
        this.unselected(rtColor[i]);
      }
    };

    if(e.target.classList.contains("select")) {
      console.log("selected already");
      this.unselected(e.target);
    }else{
      this.selected(e.target);
      var ColorPicked = e.target.classList[1];
      var silceId = itemId.slice(0,-1);
      var num = "";
      if(e.target.classList.contains("rt")){
        if(ColorPicked == "black"){
          num = "0";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "red"){
          num = "1";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "orange"){
          num = "2";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "yellow"){
          num = "3";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "grin"){
          //num = "4";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "blue"){
          num = "5";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "purple"){
          num = "6";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "brown"){
          num = "7";
          //rtImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }
        this.setState({rtMixId : silceId+num});
        if(canvasRt.indexOf(itemId) != -1){
          const str = canvasRt.replace(itemId, silceId+num);
          document.getElementById("rightImg").src = str;
        }else{
          if(canvasRt.indexOf(silceId) != -1){
            const s = canvasRt.substr(0, canvasRt.indexOf(silceId)+4) + num + canvasRt.substr(canvasRt.indexOf(silceId)+4+num.length);
            document.getElementById("rightImg").src = s;
          }
        }
      }else{
        if(ColorPicked == "black"){
          num = "0";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "red"){
          num = "1";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "orange"){
          num = "2";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "yellow"){
          num = "3";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "grin"){
          num = "4";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "blue"){
          num = "5";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "purple"){
          num = "6";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }else if(ColorPicked == "brown"){
          num = "7";
          //ltImg.src = "https://maplestory.io/api/KMS/328/item/"+silceId+num+"/icon";
        }
        this.setState({ltMixId : silceId+num});
        if(canvasLt.indexOf(itemId) != -1){
          const str = canvasLt.replace(itemId, silceId+num);
          document.getElementById("leftImg").src = str;
          mergeImages([
          { src: 'body.png' },
          { src: 'eyes.png', opacity: 0.7 }
          ]).then(b64 => document.querySelector('img').src = b64);
        }else{
          if(canvasLt.indexOf(silceId) != -1){
            const s = canvasLt.substr(0, canvasLt.indexOf(silceId)+4) + num + canvasLt.substr(canvasLt.indexOf(silceId)+4+num.length);
            document.getElementById("leftImg").src = s;
          }
        }
      }
      this.resettingValues.bind();

    }
  }

  changeZoom(e){
    const baseColorValue = document.getElementById("baseColorValue");
    const mixColorValue = document.getElementById("mixColorValue");
    const rtImg = document.getElementById("rightImage");
    var sliderValue = e.target.value;

    document.getElementById("slider").value = e.target.value;
    mixColorValue.textContent = (100-sliderValue) + "%";
    baseColorValue.textContent = sliderValue + "%";
    var newopacity = (100-sliderValue)/100; // opacity [0.0-1.0]=
    rtImg.style.opacity = newopacity;
    document.getElementById("rightImg").style.opacity = newopacity;
  }

  render() {
    const { equippedItems, localized, name, skinId } = this.props

    const isGMSRegion = localStorage['region'].toLowerCase() == 'kms'
    const hasName = name && name.length > 0
    const ltColor = document.getElementsByClassName("lt")
    const rtColor = document.getElementsByClassName("rt")
    const ltList = ltColor[0]
    const ltImg = document.getElementById("leftImage")
    const rtList = rtColor[1]
    const rtImg = document.getElementById("rightImage")

    return (
      <div className='equipped-items'>
        <div className='equipped-items-listing'>
          {
            _.map(equippedItems, item => {
              return (
                <div className='equipped-items-item'>
                  <img src={`https://maplestory.io/api/KMS/328/item/${item.id}/icon`} alt={item.name} id="leftImage"/>
                  <img src={`https://maplestory.io/api/KMS/328/item/${item.id}/icon`} alt={item.name} id="rightImage"/>
                  <div className='equipped-items-item-meta'>
                    <div className='equipped-items-item-meta-name'>{item.name}</div>
                    <div className='equipped-items-item-meta-category'>{item.typeInfo.subCategory}</div>
                    {
                      (item.typeInfo.subCategory === "Hair")
                      ? (<div className='equipped-items-item-meta-color'>
                      <input type="hidden" id="itemId" value={item.id}/>
                          <div className='equipped-items-item-meta-colors'>
                            <button className='lt black' onClick={this.chgColor.bind(this)}></button>
                            <button className='lt red' onClick={this.chgColor.bind(this)}></button>
                            <button className='lt orange' onClick={this.chgColor.bind(this)}></button>
                            <button className='lt yellow' onClick={this.chgColor.bind(this)}></button>
                            <button className='lt grin' onClick={this.chgColor.bind(this)}></button>
                            <button className='lt blue' onClick={this.chgColor.bind(this)}></button>
                            <button className='lt purple' onClick={this.chgColor.bind(this)}></button>
                            <button className='lt brown' onClick={this.chgColor.bind(this)}></button>
                          </div>
                          <div className='equipped-items-item-meta-colors'>
                            <button className='rt black' onClick={this.chgColor.bind(this)}></button>
                            <button className='rt red' onClick={this.chgColor.bind(this)}></button>
                            <button className='rt orange' onClick={this.chgColor.bind(this)}></button>
                            <button className='rt yellow' onClick={this.chgColor.bind(this)}></button>
                            <button className='rt grin' onClick={this.chgColor.bind(this)}></button>
                            <button className='rt blue' onClick={this.chgColor.bind(this)}></button>
                            <button className='rt purple' onClick={this.chgColor.bind(this)}></button>
                            <button className='rt brown' onClick={this.chgColor.bind(this)}></button>
                          </div>
                          <input type="range" min="0" max="100" id="slider" onChange={this.changeZoom.bind(this)}/>
                          <div className="values">
                            <span id="baseColorValue">50%</span>
                            <span id="mixColorValue">50%</span>
                          </div>
                        </div>)
                      : (<div className='equipped-items-item-meta'></div>)
                    }

                  </div>
                  <span onClick={this.removeItem.bind(this, item)} className="btn bg-red text-white right"><i className="fa fa-times"></i></span>
                </div>
            )})
          }
        </div>
      </div>
    )
  }

  removeItem(item) {
    this.props.onRemoveItem(item);
  }

  toggleVisibility(item) {
    this.props.onUpdateItem(item, { visible: !(item.visible === undefined ? true : item.visible) })
  }

  removeItems() {
    this.props.onRemoveItems();
  }

  updateItemHue(item, newHue) {
    if (newHue.target) newHue = newHue.target.value
    this.props.onUpdateItem(item, {hue: newHue});
  }

  updateItemContrast(item, newContrast) {
    if(newContrast.target) newContrast = newContrast.target.value
    this.props.onUpdateItem(item, {contrast: newContrast})
  }

  updateItemBrightness(item, newBrightness) {
    if(newBrightness.target) newBrightness = newBrightness.target.value
    this.props.onUpdateItem(item, {brightness: newBrightness})
  }

  updateItemAlpha(item, newAlpha) {
    if(newAlpha.target) newAlpha = newAlpha.target.value
    this.props.onUpdateItem(item, {alpha: newAlpha})
  }

  updateItemSaturation(item, newSaturation) {
    if(newSaturation.target) newSaturation = newSaturation.target.value
    this.props.onUpdateItem(item, {saturation: newSaturation})
  }

  updateItemISlot(item, newISlot) {
    if(newISlot.target) newISlot = newISlot.target.value
    this.props.onUpdateItem(item, {islot: newISlot})
  }

  updateItemVSlot(item, newVSlot) {
    if(newVSlot.target) newVSlot = newVSlot.target.value
    this.props.onUpdateItem(item, {vslot: newVSlot})
  }

  customizeItem(item) {
    return (<div className='customizing-item'>
      <span>
        <span className='flex'>Hue<input type='number' className='hue-picker-value' value={item.hue || 0} onChange={this.updateItemHue.bind(this, item)} /></span>
        <Slider
          className='hue-picker'
          value={item.hue || 0}
          min={0}
          max={360}
          handle={handle}
          onChange={this.updateItemHue.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Contrast<input type='number' className='contrast-picker-value' value={item.contrast === undefined ? 1 : item.contrast} onChange={this.updateItemContrast.bind(this, item)} /></span>
        <Slider
          className='contrast-picker'
          value={item.contrast === undefined ? 1 : item.contrast}
          min={0}
          step={0.1}
          max={10}
          handle={handle}
          onChange={this.updateItemContrast.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Brightness<input type='number' className='brightness-picker-value' value={item.brightness === undefined ? 1 : item.brightness} onChange={this.updateItemBrightness.bind(this, item)} /></span>
        <Slider
          className='brightness-picker'
          value={item.brightness === undefined ? 1 : item.brightness}
          min={0}
          step={0.1}
          max={10}
          handle={handle}
          onChange={this.updateItemBrightness.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Saturation<input type='number' className='saturation-picker-value' value={item.saturation === undefined ? 1 : item.saturation} onChange={this.updateItemSaturation.bind(this, item)} /></span>
        <Slider
          className='saturation-picker'
          value={item.saturation === undefined ? 1 : item.saturation}
          min={0}
          step={0.1}
          max={10}
          handle={handle}
          onChange={this.updateItemSaturation.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Alpha<input type='number' className='alpha-picker-value' value={item.alpha === undefined ? 1 : item.alpha} onChange={this.updateItemAlpha.bind(this, item)} /></span>
        <Slider
          className='alpha-picker'
          value={item.alpha === undefined ? 1 : item.alpha}
          min={0}
          step={0.1}
          max={1}
          handle={handle}
          onChange={this.updateItemAlpha.bind(this, item)} />
      </span>
      <span>
        <span className='flex item-property'>
          ISlot
          <input
            className='item-islot'
            value={item.islot}
            onChange={this.updateItemISlot.bind(this, item)} />
        </span>
      </span>
      <span>
        <span className='flex item-property'>
          VSlot
          <input
            className='item-vslot'
            value={item.vslot}
            onChange={this.updateItemVSlot.bind(this, item)} />
        </span>
      </span>
      <label>
        <span>Visible</span>
        <Toggle onChange={this.toggleVisibility.bind(this, item)} checked={item.visible === undefined ? true: item.visible} />
      </label>
    </div>);
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

export default EquippedItems
