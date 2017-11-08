import React, { Component } from 'react';
import classnames from 'classnames';
import math from 'mathjs';
import { debounce } from 'lodash';
import { Button } from '../../components';

import { ICONS, CURRENCIES, LIMIT_VALUES } from '../../config/constants';
import { fiatShortName, fiatFormatToCurrency, fiatSymbol } from '../../utils/currency';

import ToogleButton from './ToogleButton';
import ReviewBlock from './ReviewBlock';
import InputBlock from './InputBlock';

import {
  GROUP_CLASSES,
  TEXTS,
  SIDES,
  DECIMALS,
} from './constants';

const generateStyle = (value) => ({
  input:{
    width: `${value + 1}rem`,
  },
});

class QuickTrade extends Component {
  state = {
    side: SIDES[0],
    value: 1,
    symbol: 'btc',
    inputStyle: generateStyle(2),
  }

  componentDidMount() {
    this.onChangeSymbol(this.props.symbol);
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.symbol !== this.props.symbol) {
      this.onChangeSymbol(nextProps.symbol);
    }
  }

  onChangeSymbol = (symbol) => {
    console.log('here')
    this.setState({ symbol });
    this.requestValue({
      size: this.state.value,
      symbol: symbol,
      side: this.state.side,
    });
  }

  onToogleSide = () => {
    const side = this.state.side === SIDES[0] ? SIDES[1] : SIDES[0];
    this.setState({ side });
    this.requestValue({
      size: this.state.value,
      symbol: this.state.symbol,
      side: side,
    });
  }

  onChangeValue = (newValue) => {
    const inputValue = this.format(newValue)
    if (inputValue <= LIMIT_VALUES.SIZE.MAX && inputValue !== this.state.value) {
      const value = math.round(inputValue, DECIMALS);
      const inputStyle = generateStyle(`${value}`.length);
      this.setState({ value, inputStyle });
      this.requestValue({
        size: value,
        symbol: this.state.symbol,
        side: this.state.side,
      });
    }
  }

  format = (value = LIMIT_VALUES.SIZE.MIN) => {
    let nextValue = math.round(value, DECIMALS);
    if (value > LIMIT_VALUES.SIZE.MAX) {
      nextValue = LIMIT_VALUES.SIZE.MAX;
    } else if (value < LIMIT_VALUES.SIZE.MIN) {
      nextValue = LIMIT_VALUES.SIZE.MIN;
    }

    return nextValue;
  }

  requestValue = debounce(this.props.onRequestMarketValue, 250);

  render() {
    const { onReviewQuickTrade, quickTradeData } = this.props;
    const { side, value, symbol, inputStyle } = this.state;
    const { data, fetching, error } = quickTradeData;
    const { name } = CURRENCIES[symbol];
    return (
      <div className={classnames('quick_trade-wrapper', ...GROUP_CLASSES, 'b')}>
        <div className={classnames('quick_trade-section_wrapper', ...GROUP_CLASSES, 'c')}>
          <img src={ICONS.CHECK} alt="" />
          <div className="title">{`${TEXTS.TITLE} ${side}`}</div>
        </div>
        <div className={classnames('quick_trade-section_wrapper', ...GROUP_CLASSES, 'c')}>
          <ToogleButton
            values={SIDES}
            onToogle={this.onToogleSide}
            selected={side}
          />
        </div>
        <div className={classnames('quick_trade-section_wrapper', ...GROUP_CLASSES, 'c')}>
          <InputBlock
            onChange={this.onChangeValue}
            value={value}
            text={`${name}s ${TEXTS.TO} ${side}`}
            symbol={symbol}
            inputStyle={inputStyle}
            format={this.format}
          />
        </div>
        <div className={classnames('quick_trade-section_wrapper', ...GROUP_CLASSES, 'c')}>
          <ReviewBlock
            text={TEXTS.TOTAL_COST}
            value={data.fetching ? '-' : data.price}
          />
        </div>
        <div className={classnames('quick_trade-section_wrapper', ...GROUP_CLASSES, 'c')}>
          <Button
            label={`${TEXTS.REVIEW} ${side} ${TEXTS.ORDER}`}
            onClick={onReviewQuickTrade}
            disabled={!onReviewQuickTrade}
          />
        </div>
      </div>
    );
  }
}

QuickTrade.defaultProps = {
  onRequestMarketValue: () => {},
  onReviewQuickTrade: () => {},
  estimatedValue: 0,
};

export default QuickTrade;
