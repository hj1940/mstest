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
import textContent from 'react-addons-text-content'

class EquippedItems extends Component {
  constructor(props) {
    super(props)
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
    /*RenderCanvas*/
    const canvasLt = document.getElementById("leftImg").src;
    const canvasRt = document.getElementById("rightImg").src;

    /*CharacterList*/
    const listLt = window.getComputedStyle(document.getElementById("listImgLt")).getPropertyValue('background-image');
    const listRt = window.getComputedStyle(document.getElementById("listImgRt")).getPropertyValue('background-image');

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
        }else if(ColorPicked == "red"){
          num = "1";
        }else if(ColorPicked == "orange"){
          num = "2";
        }else if(ColorPicked == "yellow"){
          num = "3";
        }else if(ColorPicked == "grin"){
          num = "4";
        }else if(ColorPicked == "blue"){
          num = "5";
        }else if(ColorPicked == "purple"){
          num = "6";
        }else if(ColorPicked == "brown"){
          num = "7";
        }

        this.props.colorChage(silceId+num)

        /*RenderCanvas*/
        if(canvasRt.indexOf(itemId) != -1){
          const str = canvasRt.replace(itemId, silceId+num);
          document.getElementById("rightImg").setAttribute('crossOrigin', 'Anonymous');
          document.getElementById("rightImg").src = str;
          document.getElementById("rtLinkRl").value = str;
        }else{
          if(canvasRt.indexOf(silceId) != -1){
            const s = canvasRt.substr(0, canvasRt.indexOf(silceId)+4) + num + canvasRt.substr(canvasRt.indexOf(silceId)+4+num.length);
            document.getElementById("rightImg").setAttribute('crossOrigin', 'Anonymous');
            document.getElementById("rightImg").src = s;
            document.getElementById("rtLinkRl").value = s;
          }
        }

        /*CharacterList*/
        if(listRt.indexOf(itemId) != -1){
          const str = listRt.replace(itemId, silceId+num);
          document.getElementById("listImgRt").style.backgroundImage = str;
        }else{
          if(listRt.indexOf(silceId) != -1){
            const s = listRt.substr(0, listRt.indexOf(silceId)+4) + num + listRt.substr(listRt.indexOf(silceId)+4+num.length);
            document.getElementById("listImgRt").style.backgroundImage = s;
          }
        }

      }else{
        if(ColorPicked == "black"){
          num = "0";
        }else if(ColorPicked == "red"){
          num = "1";
        }else if(ColorPicked == "orange"){
          num = "2";
        }else if(ColorPicked == "yellow"){
          num = "3";
        }else if(ColorPicked == "grin"){
          num = "4";
        }else if(ColorPicked == "blue"){
          num = "5";
        }else if(ColorPicked == "purple"){
          num = "6";
        }else if(ColorPicked == "brown"){
          num = "7";
        }

        this.props.equippedItems.Hair.id = silceId+num;

        /*RenderCanvas*/
        if(canvasLt.indexOf(itemId) != -1){
          const str = canvasLt.replace(itemId, silceId+num);
          document.getElementById("leftImg").setAttribute('crossOrigin', 'Anonymous');
          document.getElementById("leftImg").src = str;
        }else{
          if(canvasLt.indexOf(silceId) != -1){
            const s = canvasLt.substr(0, canvasLt.indexOf(silceId)+4) + num + canvasLt.substr(canvasLt.indexOf(silceId)+4+num.length);
            document.getElementById("leftImg").setAttribute('crossOrigin', 'Anonymous');
            document.getElementById("leftImg").src = s;
          }
        }

        /*CharacterList*/
        if(listLt.indexOf(itemId) != -1){
          const str = listLt.replace(itemId, silceId+num);
          document.getElementById("listImgLt").style.backgroundImage = str;
        }else{
          if(listLt.indexOf(silceId) != -1){
            const s = listLt.substr(0, listLt.indexOf(silceId)+4) + num + listLt.substr(listLt.indexOf(silceId)+4+num.length);
            document.getElementById("listImgLt").style.backgroundImage = s;
          }
        }
      }
      this.resettingValues.bind();
    }
  }

  chgEyeColor(e){
    const ltColor = document.getElementsByClassName("lte");
    const rtColor = document.getElementsByClassName("rte");
    const itemId = document.getElementById("itemIde").value;

    /*RenderCanvas*/
    const canvasLt = document.getElementById("leftImg").src;
    const canvasRt = document.getElementById("rightImg").src;

    /*CharacterList*/
    const listLt = window.getComputedStyle(document.getElementById("listImgLt")).getPropertyValue('background-image');
    const listRt = window.getComputedStyle(document.getElementById("listImgRt")).getPropertyValue('background-image');

    for(let i=0; i<8; i++){
      if(ltColor[i].classList.contains("select") && ltColor[i] != e.target && e.target.classList.contains("lte")){
        this.unselected(ltColor[i]);
      }
      if(rtColor[i].classList.contains("select") && rtColor[i] != e.target && e.target.classList.contains("rte")){
        this.unselected(rtColor[i]);
      }
    };

    if(e.target.classList.contains("select")) {
      console.log("selected already");
      this.unselected(e.target);
    }else{
      this.selected(e.target);
      var ColorPicked = e.target.classList[1];
      var silceIdFr = itemId.slice(0,2);
      var silceIdEd = itemId.slice(3,5);
      var num = "";
      if(e.target.classList.contains("rte")){
        if(ColorPicked == "black"){
          num = "0";
        }else if(ColorPicked == "blue"){
          num = "1";
        }else if(ColorPicked == "red"){
          num = "2";
        }else if(ColorPicked == "grin"){
          num = "3";
        }else if(ColorPicked == "brown"){
          num = "4";
        }else if(ColorPicked == "emerald"){
          num = "5";
        }else if(ColorPicked == "purple"){
          num = "6";
        }else if(ColorPicked == "amethyst"){
          num = "7";
        }

        /*RenderCanvas*/
        if(canvasRt.indexOf(itemId) != -1){
          const str = canvasRt.replace(itemId, silceIdFr+num+silceIdEd);
          document.getElementById("rightImg").setAttribute('crossOrigin', 'Anonymous');
          document.getElementById("rightImg").src = str;
        }else{
          if(canvasRt.indexOf(silceIdFr) != -1 && canvasRt.indexOf(silceIdEd) != -1){
            const s = canvasRt.substr(0, canvasRt.indexOf("%22itemId%22%3A"+silceIdFr)+17) + num + canvasRt.substr(canvasRt.indexOf("%22itemId%22%3A"+silceIdFr)+17+num.length);
            document.getElementById("rightImg").setAttribute('crossOrigin', 'Anonymous');
            document.getElementById("rightImg").src = s;
          }
        }

        /*CharacterList*/
        if(listRt.indexOf(itemId) != -1){
          const str = listRt.replace(itemId, silceIdFr+num+silceIdEd);
          document.getElementById("listImgRt").style.backgroundImage = str;
        }else{
          if(listRt.indexOf(silceIdFr) != -1 && listRt.indexOf(silceIdEd) != -1){
            const s = listRt.substr(0, listRt.indexOf("%22itemId%22%3A"+silceIdFr)+17) + num + listRt.substr(listRt.indexOf("%22itemId%22%3A"+silceIdFr)+17+num.length);
            document.getElementById("listImgRt").style.backgroundImage = s;
          }
        }
      }else{
        if(ColorPicked == "black"){
          num = "0";
        }else if(ColorPicked == "blue"){
          num = "1";
        }else if(ColorPicked == "red"){
          num = "2";
        }else if(ColorPicked == "grin"){
          num = "3";
        }else if(ColorPicked == "brown"){
          num = "4";
        }else if(ColorPicked == "emerald"){
          num = "5";
        }else if(ColorPicked == "purple"){
          num = "6";
        }else if(ColorPicked == "amethyst"){
          num = "7";
        }

        /*RenderCanvas*/
        if(canvasLt.indexOf(itemId) != -1){
          const str = canvasLt.replace(itemId, silceIdFr+num+silceIdEd);
          document.getElementById("leftImg").setAttribute('crossOrigin', 'Anonymous');
          document.getElementById("leftImg").src = str;
        }else{
          if(canvasLt.indexOf(silceIdFr) != -1 && canvasLt.indexOf(silceIdEd) != -1){
            const s = canvasLt.substr(0, canvasLt.indexOf("%22itemId%22%3A"+silceIdFr)+17) + num + canvasLt.substr(canvasLt.indexOf("%22itemId%22%3A"+silceIdFr)+17+num.length);
            document.getElementById("leftImg").setAttribute('crossOrigin', 'Anonymous');
            document.getElementById("leftImg").src = s;
          }
        }

        /*CharacterList*/
        if(listLt.indexOf(itemId) != -1){
          const str = listLt.replace(itemId, silceIdFr+num+silceIdEd);
          document.getElementById("listImgLt").style.backgroundImage = str;
        }else{
          if(listLt.indexOf(silceIdFr) != -1 && listLt.indexOf(silceIdEd) != -1){
            const s = listLt.substr(0, listLt.indexOf("%22itemId%22%3A"+silceIdFr)+17) + num + listLt.substr(listLt.indexOf("%22itemId%22%3A"+silceIdFr)+17+num.length);
            document.getElementById("listImgLt").style.backgroundImage = s;
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
    document.getElementById("listImgRt").style.opacity = newopacity;
  }

  render() {
    const { equippedItems, localized, name, skinId, ...otherProps } = this.props

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
                    {
                      (item.typeInfo.subCategory === "Face")
                      ? (<div className='equipped-items-item-meta-color'>
                      <input type="hidden" id="itemIde" value={item.id}/>
                          <div className='equipped-items-item-meta-colors'>
                            <button className='lte black' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='lte blue' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='lte red' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='lte grin' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='lte brown' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='lte emerald' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='lte purple' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='lte amethyst' onClick={this.chgEyeColor.bind(this)}></button>
                          </div>
                          <div className='equipped-items-item-meta-colors'>
                            <button className='rte black' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='rte blue' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='rte red' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='rte grin' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='rte brown' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='rte emerald' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='rte purple' onClick={this.chgEyeColor.bind(this)}></button>
                            <button className='rte amethyst' onClick={this.chgEyeColor.bind(this)}></button>
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
