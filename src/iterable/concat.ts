'use strict';

import { IIterable, IIterator } from '../iterable.interfaces';
import { Iterable } from '../iterable';
import { Iterator } from '../iterator';
import { ArrayIterator } from './arrayiterable';

export class ConcatIterator<T> extends Iterator<T> {
  private _it: IIterator<T>;
  private _innerIt: IIterator<T>;

  constructor(...it: IIterator<T>[]) {
    super();
    this._it = new ArrayIterator(it);
    this._innerIt = null;
  }

  next() {
    let outerNext;
    while (1) {
      if (!this._innerIt) {
        outerNext = this._it.next();
        if (outerNext.done) { return outerNext; }
        
        let innerItem = outerNext.value;
        this._innerIt = innerItem[Symbol.iterator]();
      }
      
      let innerNext = this._innerIt.next();
      if (innerNext.done) {
        this._innerIt = null;
      } else {
        return { done: false, value: innerNext.value };
      }
    }    
  }
}

export class ConcatIterable<T> extends Iterable<T> {
  private _source: IIterable<T>[];

  constructor(...source: IIterable<T>[]) {
    super();
    this._source = source;
  }

  [Symbol.iterator]() {
    return new ConcatIterator<T>(...this._source.map(x => x[Symbol.iterator]()));
  }
}

export function concat<T>(source: IIterable<T>, ...args: IIterable<T>[]): Iterable<T> {
  return new ConcatIterable(...[source].concat(...args));
}

export function concatStatic<T>(...args: IIterable<T>[]): Iterable<T> {
  return new ConcatIterable(...args);
}