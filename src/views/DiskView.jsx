import React from 'react';
import SculptureStore from '../game-logic/sculpture-store';
import DiskGameLogic from '../game-logic/logic/disk-game-logic';
import Graphics from './svg/disk-game.svg';

const diskConfig = {
  level0: {
    stroke: "none",
    disk0: [513.32, 444.145],
    disk1: [186.945, 444.14],
    disk2: [350.33, 161.9],
    disk0Aesthetic: [513.32, 444.145],
    disk1Aesthetic: [186.945, 444.14],
    disk2Aesthetic: [350.33, 161.9],
  },
  level1: {
    stroke: "none",
    disk0: [513.32, 444.145],
    disk1: [186.945, 444.14],
    disk2: [350.33, 161.9],
    disk0Aesthetic: [513.32, 444.145],
    disk1Aesthetic: [186.945, 444.14],
    disk2Aesthetic: [350.33, 161.9],
  },
  level2: {
    stroke: "#000000",
    disk0: [453.1, 409.205],
    disk1: [245.366, 410.247],
    disk2: [350,230.165],
    disk0Aesthetic: [143.104,231.203],
    disk1Aesthetic: [569.5, 232.184],
    disk2Aesthetic: [350, 587.797],
  },
};

const SingleDisk = ({position, url}) => {
  return <image xlinkHref={url} x={0} y={0} height={100} width={100}
                transform={`rotate(${position}) translate(-50 -50)`}/>;
};

SingleDisk.propTypes = {
  position: React.PropTypes.number.isRequired,
  url: React.PropTypes.string.isRequired,
};

export default class DiskView extends React.Component {
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
      disk0: 0,
      disk1: 0,
      disk2: 0,
      disk0Color: '#000000',
      disk1Color: '#000000',
      disk2Color: '#000000',
      disk0Stroke: 1,
      disk1Stroke: 1,
      disk2Stroke: 1,
      level: 0,
      active: false,
      showCircle: false,
      showPuzzle: false,
    };
  }

  get disks() {
    return this.props.store.data.get('disk').get('disks');
  }

  get lightArray() {
    return this.props.store.data.get('lights');
  }

  handleChanges = (changes) => this._handleChanges(changes);
  handleLocalChanges = (changes) => this._handleLocalChanges(changes);

  componentDidMount() {
    this.props.store.addListener(SculptureStore.EVENT_CHANGE, this.handleChanges);
    this.props.store.addListener(SculptureStore.EVENT_LOCAL_CHANGE, this.handleLocalChanges);
  }

  componentWillUnmount() {
    this.props.store.removeListener(SculptureStore.EVENT_CHANGE, this.handleChanges);
    this.props.store.removeListener(SculptureStore.EVENT_LOCAL_CHANGE, this.handleLocalChanges);
  }

  _handleChanges(changes) {
    this.setState({active: this.props.store.isPlayingDiskGame});

    if (changes.lights && changes.lights[this.props.config.LIGHTS.ART_LIGHTS_STRIP]) {
      this.setState({showCircle: this.lightArray.getIntensity(this.props.config.LIGHTS.ART_LIGHTS_STRIP, '3') > 0});
    }
    if (changes.disk) {
      // Show puzzle when active
      if (changes.disk.state) {
        this.setState({
          showPuzzle: [DiskGameLogic.STATE_FADE_IN, DiskGameLogic.STATE_SHUFFLE, DiskGameLogic.STATE_ACTIVE, DiskGameLogic.STATE_WINNING].includes(changes.disk.state)
        });
      }
      // Handle level changes
      if (changes.disk.hasOwnProperty('level')) {
        this.setState({level: changes.disk.level});
      }
      // Show location color of moving disks
      // FIXME: Solve this in a better way:
      if (this.state.level >= 3) return;
      for (const diskId of this.disks) {
        let color = diskConfig[`level${this.state.level}`].stroke;
        let stroke = 1;
        const userId = this.disks.get(diskId).getUser();
        if (userId) {
          const colorId = this.props.config.getLocationColor(userId);
          if (colorId) {
            color = this.props.config.getWebColor(colorId);
            stroke = 5;
          }
        }
        this.setState({ [`${diskId}Color`]: color, [`${diskId}Stroke`]: stroke });
      }
    }
  }

  _handleLocalChanges() {
    // Handle local position state
    for (let diskId of ['disk0', 'disk1', 'disk2']) {
      this.setState({[diskId]: this.props.store.getDiskPosition(diskId)});
    }
  }

  render() {
    return this.state.active && this.state.level < 3 && <svg id="disk-view" viewBox="0 0 700 700" style={{
      position: "relative",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
    }}>
      <g display="none"><Graphics/></g>
      <g className="transformOrigin" style={{transform: `translate(${this.props.translate[0]}px, ${this.props.translate[1]}px) scale(${this.props.scale}) rotate(${this.props.rotate}deg)`}}>
          {this.state.showCircle && <use xlinkHref="#circle"/>}
          <use xlinkHref={`#level${this.state.level}`}
               style={{
                 opacity: this.state.showPuzzle ? 1 : 0,
                 transition: "opacity 2s ease-in",
               }}/>
      { ['disk0', 'disk1', 'disk2'].map((diskId) => {
        return <use key={diskId}
                    xlinkHref={`#level${this.state.level}-${diskId}`}
                    style={{
                      transformOrigin: diskConfig[`level${this.state.level}`][diskId].map((c) => `${c}px`).join(' '),
                      transform: `rotate(${this.state[diskId]}deg)`,
                      opacity: this.state.showPuzzle ? 1 : 0,
                      transition: "opacity 2s ease-in",
                      stroke: this.state[`${diskId}Color`],
                      strokeWidth: this.state[`${diskId}Stroke`],
                    }}/>;
      }) }
      { ['disk0', 'disk1', 'disk2'].map((diskId) => {
        return <use key={diskId}
                    xlinkHref={`#level${this.state.level}-${diskId}-aesthetic`}
                    style={{
                      transformOrigin: diskConfig[`level${this.state.level}`][`${diskId}Aesthetic`].map((c) => `${c}px`).join(' '),
                      transform: `rotate(${-this.state[diskId]}deg)`,
                      opacity: this.state.showPuzzle ? 1 : 0,
                      transition: "opacity 2s ease-in",
                    }}/>;
      }) }
      </g>
    </svg>;
  }
}
