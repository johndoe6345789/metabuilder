/**
 * Priority Queue implementation for workflow DAG execution
 * Used to manage node execution order with priority-based scheduling
 */

export interface QueueItem<T> {
  item: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: QueueItem<T>[] = [];

  /**
   * Insert item with priority (lower number = higher priority)
   */
  enqueue(item: T, priority: number): void {
    const queueItem: QueueItem<T> = { item, priority };
    this.heap.push(queueItem);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return highest priority item
   */
  dequeue(): QueueItem<T> | undefined {
    if (this.heap.length === 0) return undefined;

    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0 && bottom) {
      this.heap[0] = bottom;
      this._bubbleDown(0);
    }

    return top;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Move element up to maintain heap property
   */
  private _bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority < this.heap[parentIndex].priority) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Move element down to maintain heap property
   */
  private _bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }

      if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }

  /**
   * Peek at highest priority item without removing
   */
  peek(): QueueItem<T> | undefined {
    return this.heap[0];
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.heap = [];
  }
}
