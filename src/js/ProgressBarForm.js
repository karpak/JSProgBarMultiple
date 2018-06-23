import "../css/progbar.css";
import React, {Component} from "react";
import ReactDOM from "react-dom";

class ProgressBar extends Component {
    constructor(props) {
        super(props);
        this.limit=this.props.limit;
    }

    render() {
        var progBarList=[];
        var pbStyle={}, pgStyle={};
        var gapBetweenButton = 6;
        var buttonHeight;
        this.numberofbars = this.props.bars.length;
        buttonHeight = ((100-((this.numberofbars)*gapBetweenButton))/this.numberofbars) ;
        for (var i=0; i<this.props.bars.length;i++){

            pbStyle={
                position:"absolute",
                top: (i*(buttonHeight+gapBetweenButton))+'%', /* 25% selection and 4% gap in between each button lengeh of 67/nuber of button */
                height: buttonHeight + "%" /* balance is 67% after dropdonw and gaps */
            };
            //var percentageProgress=Math.trunc(this.props.bars[i]/this.props.limit*100);
            var percentageProgress=Math.trunc(this.props.bars[i]/this.props.limit*100);
            var alertBg=false;
            var cuntr=i;

            if (percentageProgress>100){
                alertBg=true;
                pgStyle={
                    width:"100%"
                };
            } else {
                alertBg = false;
                pgStyle={
                    width:percentageProgress+"%"
                };
            }

            /* {;} --> Thought of introducting the click even on the bar, so that progress bar can be selected insted of using dropdown */
            progBarList.push(
                <div className="progbar unselectable" style={pbStyle}>
                    <div id={"prog"+i} className={"progress" + ((alertBg)?" exceeded":"")} style={pgStyle}></div>
                    <div className="progtext" onClick={function(x){return function() {;}}(cuntr)}><p>{percentageProgress+"%"}</p></div>
                </div>
            )
        }

        return (
            <div className="progbargroup">
                {progBarList}
            </div>
        );
    }
}



class Buttons extends Component {
    constructor(props) {
        super(props);
        this.changeProgressBar=this.changeProgressBar.bind(this);
        this.handleEvent = this.handleEvent.bind(this);
    }

    handleEvent(incdec){
        var onSelection = this.props.onSelection;
        return function(){
            onSelection(0,incdec);
        }
    }

    changeProgressBar(){
        var x = document.getElementById("pbar").value;
        this.props.onSelection(x,false);
    }

    render() {
        var progressBarNames=[];
        var buttonList=[];
        var ddStyle={
            width:'25%'
        };

        var btStyle={};

        //Combo box to select the progress bar
        for (var i=0;i<this.props.noofbar;i++){
            progressBarNames.push(
                <option
                    value={i}
                    selected={this.props.curbar === i?"selected":""} >
                    {"Progress"+(i+1)}
                </option>
            );
        }
        
        //Buttons to increment or decrement the seleted progress bar
        for (var i=0;i<this.props.buttons.length;i++){
            btStyle={
                position:"relative",
                left: (2*(i+1))+'%', /* 25% selection and 2% gap in between each button lengeh of 67/nuber of button */
                width: (67/this.props.buttons.length) + "%" /* balance is 67% after dropdonw and gaps */
            };
            buttonList.push(
                <button
                    class="button"
                    style={btStyle}
                    onClick={this.handleEvent(this.props.buttons[i])}>
                    {this.props.buttons[i]}
                </button>
            );
        }

        return (
            <div className="buttonbar">
                <select id="pbar" style={ddStyle} onChange={this.changeProgressBar}>
                {progressBarNames}
                </select>
                {buttonList}
            </div>
        );
    }
}

class ProgBarWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prevBars:[],
            bars:[],
            curbar:0,
            buttons:[],
            limit:0
        };

        this.handleUserInput = this.handleUserInput.bind(this);
        this.getInput = this.getInput.bind(this);
    }

    handleUserInput(curbar, incdec){
        if(incdec===false){
            this.state.curbar=curbar;
        }
        else
        {
            var newBars=this.state.bars;
            newBars[this.state.curbar]=(newBars[this.state.curbar]+incdec)<0?0:(newBars[this.state.curbar]+incdec);
            this.setState(
                {
                    bars:newBars,
                    curbar:this.state.curbar,
                }
            )
        }
    }

    getInput(inpUrl, resCallBack) {
        var xmlRequest = new XMLHttpRequest();
        xmlRequest.onreadystatechange = function() { 
            if (xmlRequest.readyState == 4 && xmlRequest.status == 200)
                resCallBack(xmlRequest.responseText);
            else
                resCallBack(null);
        }
        xmlRequest.open("GET", inpUrl, true);
        xmlRequest.send(null);
    }

    componentDidMount() {
        this.getInput("http://pb-api.herokuapp.com/bars",
            function(data) {
                if (data !== null) {
                    var inpJson = JSON.parse(data)

                    this.setState({
                        prevBars:[],
                        bars:inpJson.bars.slice(0),
                        curbar:0,
                        buttons:inpJson.buttons.slice(0),
                        limit:inpJson.limit
                    });
                } else {
                    this.setState({
                        prevBars:[],
                        bars:[0,0,0,0],
                        curbar:0,
                        buttons:[-50,-10,10,50],
                        limit:200
                    });
                }
            }.bind(this)
        );
    }
    render() {
        return (
            <div id="mainWindow" className="progbarwindow">
                <ProgressBar appstate={this.state} bars={this.state.bars} limit={this.state.limit}/>
                <Buttons
                    noofbar={this.state.bars.length}
                    buttons={this.state.buttons}
                    curbar={this.state.curbar}
                    onSelection={this.handleUserInput}
                />
            </div>
        );
    }
}

const wrapper = document.getElementById("progBarApp");
wrapper ? ReactDOM.render( <ProgBarWindow /> , wrapper) : false;

export default ProgBarWindow;
