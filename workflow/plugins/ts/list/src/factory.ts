/**
 * Factory for list plugin classes.
 */

import {
  ListConcat,
  ListLength,
  ListSlice,
  ListFind,
  ListFindIndex,
  ListFilter,
  ListMap,
  ListReduce,
  ListEvery,
  ListSome,
  ListSort,
  ListReverse,
  ListUnique,
  ListFlatten,
  ListPush,
  ListPop,
  ListShift,
  ListUnshift,
  ListIncludes,
  ListIndexOf,
  ListAt,
  ListGroupBy,
} from './index';

export function createListConcat(): ListConcat {
  return new ListConcat();
}

export function createListLength(): ListLength {
  return new ListLength();
}

export function createListSlice(): ListSlice {
  return new ListSlice();
}

export function createListFind(): ListFind {
  return new ListFind();
}

export function createListFindIndex(): ListFindIndex {
  return new ListFindIndex();
}

export function createListFilter(): ListFilter {
  return new ListFilter();
}

export function createListMap(): ListMap {
  return new ListMap();
}

export function createListReduce(): ListReduce {
  return new ListReduce();
}

export function createListEvery(): ListEvery {
  return new ListEvery();
}

export function createListSome(): ListSome {
  return new ListSome();
}

export function createListSort(): ListSort {
  return new ListSort();
}

export function createListReverse(): ListReverse {
  return new ListReverse();
}

export function createListUnique(): ListUnique {
  return new ListUnique();
}

export function createListFlatten(): ListFlatten {
  return new ListFlatten();
}

export function createListPush(): ListPush {
  return new ListPush();
}

export function createListPop(): ListPop {
  return new ListPop();
}

export function createListShift(): ListShift {
  return new ListShift();
}

export function createListUnshift(): ListUnshift {
  return new ListUnshift();
}

export function createListIncludes(): ListIncludes {
  return new ListIncludes();
}

export function createListIndexOf(): ListIndexOf {
  return new ListIndexOf();
}

export function createListAt(): ListAt {
  return new ListAt();
}

export function createListGroupBy(): ListGroupBy {
  return new ListGroupBy();
}

// Factory map for all list plugins
export const factories = {
  'list.concat': createListConcat,
  'list.length': createListLength,
  'list.slice': createListSlice,
  'list.find': createListFind,
  'list.findIndex': createListFindIndex,
  'list.filter': createListFilter,
  'list.map': createListMap,
  'list.reduce': createListReduce,
  'list.every': createListEvery,
  'list.some': createListSome,
  'list.sort': createListSort,
  'list.reverse': createListReverse,
  'list.unique': createListUnique,
  'list.flatten': createListFlatten,
  'list.push': createListPush,
  'list.pop': createListPop,
  'list.shift': createListShift,
  'list.unshift': createListUnshift,
  'list.includes': createListIncludes,
  'list.indexOf': createListIndexOf,
  'list.at': createListAt,
  'list.groupBy': createListGroupBy,
};

export default factories;
