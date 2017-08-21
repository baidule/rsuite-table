import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { DOMMouseMoveTracker } from 'dom-lib';
import _ from 'lodash';
import decorate from './utils/decorate';


const propTypes = {
  height: PropTypes.number,
  initialEvent: PropTypes.object,
  columnWidth: PropTypes.number,
  columnLeft: PropTypes.number,
  columnFixed: PropTypes.bool,
  onColumnResizeStart: PropTypes.func,
  onColumnResizeEnd: PropTypes.func,
  onColumnResizeMove: PropTypes.func,
};

class ColumnResizeHandler extends React.Component {
  constructor(props) {
    super(props);
    this.columnWidth = props.columnWidth || 0;
    this.cursorDelta = 0;
  }


  componentWillReceiveProps(nextProps) {
    if (this.isKeyDown && nextProps.initialEvent && !this.mouseMoveTracker.isDragging()) {
      this.mouseMoveTracker.captureMouseMoves(nextProps.initialEvent);
    }
    if (nextProps.columnWidth !== this.props.columnWidth) {
      /* istanbul ignore next */
      this.columnWidth = nextProps.columnWidth;
    }
  }

  componentWillUnmount() {
    /* istanbul ignore next */
    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  onMove = (deltaX) => {

    if (!this.isKeyDown) {
      return;
    }

    /* istanbul ignore next */
    const { onColumnResizeMove, columnWidth, columnLeft, columnFixed } = this.props;
    this.cursorDelta += deltaX;
    this.columnWidth = _.clamp(columnWidth + this.cursorDelta, 20);
    onColumnResizeMove && onColumnResizeMove(this.columnWidth, columnLeft, columnFixed);
  }
  onColumnResizeEnd = () => {

    const { onColumnResizeEnd } = this.props;
    this.isKeyDown = false;

    onColumnResizeEnd && onColumnResizeEnd(
      this.columnWidth,
      this.cursorDelta
    );

    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }
  onColumnResizeMouseDown = (event) => {
    const { onColumnResizeStart } = this.props;
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.isKeyDown = true;
    this.cursorDelta = 0;

    /* istanbul ignore next */
    onColumnResizeStart && onColumnResizeStart({
      clientX: event.clientX,
      clientY: event.clientY,
      preventDefault: () => { }
    });
  }
  getMouseMoveTracker() {

    /* istanbul ignore next */
    return this.mouseMoveTracker || new DOMMouseMoveTracker(
      this.onMove,
      this.onColumnResizeEnd,
      document.body
    );
  }

  render() {


    const { columnLeft = 0, height, className, style, ...props } = this.props;
    const styles = {
      width: 6,
      left: (this.columnWidth + columnLeft) - 2,
      height,
      ...style
    };

    const classes = classNames(this.prefix('column-resize-spanner'), className);
    const elementProps = _.omit(props, Object.keys(propTypes));

    return (
      <div
        {...elementProps}
        className={classes}
        style={styles}
        onMouseDown={this.onColumnResizeMouseDown}
        role="button"
        tabIndex={-1}
      />
    );
  }

}

ColumnResizeHandler.propTypes = propTypes;

export default decorate()(ColumnResizeHandler);