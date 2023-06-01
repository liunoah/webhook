class Queue {
    constructor() {
        this.items = [];
        this.isProcessing = false;
    }

    enqueue(item) {
        this.items.push(item);
        if (!this.isProcessing) {
            this.isProcessing = true;
            this.processQueue();
        }
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    async processQueue() {
        while (!this.isEmpty()) {
            const item = this.items[0];
            console.log(`处理任务：${JSON.stringify(item)}`);
            // 执行任务...
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`任务处理完毕：${JSON.stringify(item)}`);
            this.dequeue();
        }
        this.isProcessing = false;
    }
}

// 示例代码
const queue = new Queue();

queue.enqueue({ id: 1, name: 'task1' });
queue.enqueue({ id: 2, name: 'task2' });
queue.enqueue({ id: 3, name: 'task3' });
