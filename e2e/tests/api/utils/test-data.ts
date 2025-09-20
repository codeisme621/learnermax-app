export interface TestItem {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestDataOptions {
  prefix?: string;
  timestamp?: boolean;
  unique?: boolean;
}

export class TestDataGenerator {
  private static instanceCounter = 0;

  static generateItem(options: TestDataOptions = {}): Omit<TestItem, 'createdAt' | 'updatedAt'> {
    const {
      prefix = 'test-item',
      timestamp = true,
      unique = true
    } = options;

    let id = prefix;

    if (timestamp) {
      id += `-${Date.now()}`;
    }

    if (unique) {
      this.instanceCounter++;
      id += `-${this.instanceCounter}`;
    }

    return {
      id,
      name: `Test Learning Item - ${id}`
    };
  }

  static generateItems(count: number, options: TestDataOptions = {}): Omit<TestItem, 'createdAt' | 'updatedAt'>[] {
    return Array.from({ length: count }, (_, index) => {
      const itemOptions = {
        ...options,
        prefix: `${options.prefix || 'test-item'}-${index + 1}`
      };
      return this.generateItem(itemOptions);
    });
  }

  static generateValidItem(): Omit<TestItem, 'createdAt' | 'updatedAt'> {
    return this.generateItem({
      prefix: 'valid-item',
      timestamp: true,
      unique: true
    });
  }

  static generateInvalidItems(): Array<{ data: any; expectedError: string }> {
    return [
      {
        data: { name: 'Missing ID' },
        expectedError: 'id is required'
      },
      {
        data: { id: 'missing-name' },
        expectedError: 'name is required'
      },
      {
        data: { id: '', name: 'Empty ID' },
        expectedError: 'id cannot be empty'
      },
      {
        data: { id: 'empty-name', name: '' },
        expectedError: 'name cannot be empty'
      },
      {
        data: {},
        expectedError: 'Both id and name are required'
      }
    ];
  }

  static generateLargeItem(): Omit<TestItem, 'createdAt' | 'updatedAt'> {
    return {
      id: `large-item-${Date.now()}`,
      name: 'Large Item - ' + 'A'.repeat(1000) // 1KB name
    };
  }

  static generateItemWithSpecialCharacters(): Omit<TestItem, 'createdAt' | 'updatedAt'> {
    return {
      id: `special-chars-${Date.now()}`,
      name: 'Special Characters: åàáâãäæçðéèêëíìîïñóòôõöøúùûüýþÿ'
    };
  }

  static generateItemWithEmojis(): Omit<TestItem, 'createdAt' | 'updatedAt'> {
    return {
      id: `emoji-item-${Date.now()}`,
      name: 'Learning JavaScript 🚀📚💻 - Advanced Concepts 🔥'
    };
  }

  static generateItemsForConcurrency(count: number): Omit<TestItem, 'createdAt' | 'updatedAt'>[] {
    const timestamp = Date.now();
    return Array.from({ length: count }, (_, index) => ({
      id: `concurrent-${timestamp}-${index}`,
      name: `Concurrent Test Item ${index + 1}`
    }));
  }

  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateItemWithLength(nameLength: number): Omit<TestItem, 'createdAt' | 'updatedAt'> {
    return {
      id: `length-test-${Date.now()}`,
      name: this.generateRandomString(nameLength)
    };
  }

  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}

export const testData = {
  // Predefined test items for common scenarios
  validItem: {
    id: 'predefined-valid-item',
    name: 'Predefined Valid Learning Item'
  },

  // Edge cases
  minimalItem: {
    id: 'a',
    name: 'A'
  },

  // Performance test data
  performanceItems: TestDataGenerator.generateItems(100, {
    prefix: 'perf-test',
    timestamp: false,
    unique: true
  }),

  // Stress test data
  stressTestItems: TestDataGenerator.generateItems(1000, {
    prefix: 'stress-test',
    timestamp: false,
    unique: true
  })
};

export default TestDataGenerator;