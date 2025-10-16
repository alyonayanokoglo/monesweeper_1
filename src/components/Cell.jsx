import React from 'react';
import bagIcon from '../img/bag.svg';
import flagIcon from '../img/flag.svg';

const Cell = ({ cell, onLeftClick, onRightClick }) => {
  const handleClick = () => {
    if (!cell.isRevealed && !cell.isFlagged) {
      onLeftClick();
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cell.isRevealed) {
      onRightClick();
    }
  };

  const getCellContent = () => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? <img src={flagIcon} alt="flag" className="flag-icon" /> : '';
    }
    if (cell.isMine) {
      return <img src={bagIcon} alt="bag" className="bag-icon" />;
    }
    if (cell.neighborMines > 0) {
      return cell.neighborMines;
    }
    return '';
  };

  const getCellClass = () => {
    let className = 'cell';
    if (cell.isRevealed) {
      className += ' revealed';
      if (cell.isMine) {
        className += ' mine';
      } else if (cell.neighborMines > 0) {
        className += ` number-${cell.neighborMines}`;
      }
    } else {
      className += ' hidden';
    }
    return className;
  };

  return (
    <div
      className={getCellClass()}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;

