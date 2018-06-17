import React from 'react';
import SculptureStore from '../game-logic/sculpture-store';
import SimonGameLogic from '../game-logic/logic/simon-game-logic';
import Graphics from './svg/simon-game.svg';

export default class SimonView extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired,
    scale: React.PropTypes.number,
    translate: React.PropTypes.arrayOf(React.PropTypes.number),
    rotate: React.PropTypes.number,
  };
  static defaultProps = {
    scale: 1,
    translate: [0, 0],
    rotate: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      showGraphics: false,
    };
  }

  handleChanges = (changes) => this._handleChanges(changes);

  componentDidMount() {
    this.props.store.addListener(SculptureStore.EVENT_CHANGE, this.handleChanges);
  }

  componentWillUnmount() {
    this.props.store.removeListener(SculptureStore.EVENT_CHANGE, this.handleChanges);
  }

  _handleChanges(changes) {
    this.setState({active: this.props.store.isPlayingSimonGame});

    if (changes.simon) {
      if (changes.simon.state === SimonGameLogic.STATE_COMPLETE) {
        this.setState({ showGraphics: true });
      }
      else if (changes.simon.state === SimonGameLogic.STATE_DONE) {
        this.setState({ showGraphics: false });
      }
    }
  }

  render() {
    return this.state.active && <svg id="simon-view" viewBox="0 0 700 700" style={{
      position: "relative",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
    }}>
      <g display="none"><Graphics/></g>
      <g className="transformOrigin" style={{transform: `translate(${this.props.translate[0]}px, ${this.props.translate[1]}px) scale(${this.props.scale}) rotate(${this.props.rotate}deg)`}}>
          <use xlinkHref="#circle"
               style={{
                 opacity: this.state.showGraphics ? 1 : 0,
                 transition: "opacity 2s ease-in",
               }}/>
          <use xlinkHref="#spots"
               style={{
                 opacity: this.state.showGraphics ? 1 : 0,
                 transition: "opacity 2s ease-in",
               }}/>
      </g>
    </svg>;
  }
}
