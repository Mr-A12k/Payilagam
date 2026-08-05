const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const problems = [
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description:
      "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "easy",
    constraints:
      "- `1 <= s.length <= 104`\n- `s` consists of parentheses only `'()[]{}'`.",
    inputFormat: "A single string `s`",
    outputFormat: "A boolean indicating whether the string is valid",
    sampleInput: `"()"`,
    sampleOutput: `true`,
    explanation:
      "The string only contains matching open and close parentheses.",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript: "function isValid(s) {\n  // Write your code here\n}",
      python: "def is_valid(s):\n    # Write your code here\n    pass",
    }),
    tags: ["String", "Stack"],
    testCases: [
      { input: `"()"`, expectedOutput: `true`, isHidden: false, orderIndex: 1 },
      {
        input: `"()[]{}"`,
        expectedOutput: `true`,
        isHidden: false,
        orderIndex: 2,
      },
      {
        input: `"(]"`,
        expectedOutput: `false`,
        isHidden: false,
        orderIndex: 3,
      },
      {
        input: `"([)]"`,
        expectedOutput: `false`,
        isHidden: true,
        orderIndex: 4,
      },
      {
        input: `"{[]}"`,
        expectedOutput: `true`,
        isHidden: true,
        orderIndex: 5,
      },
    ],
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    description:
      "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    difficulty: "medium",
    constraints:
      "- `1 <= intervals.length <= 104`\n- `intervals[i].length == 2`\n- `0 <= start_i <= end_i <= 104`",
    inputFormat: "A 2D array of integers `intervals`",
    outputFormat: "A 2D array of merged intervals",
    sampleInput: `[[1,3],[2,6],[8,10],[15,18]]`,
    sampleOutput: `[[1,6],[8,10],[15,18]]`,
    explanation:
      "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript: "function merge(intervals) {\n  // Write your code here\n}",
      python: "def merge(intervals):\n    # Write your code here\n    pass",
    }),
    tags: ["Array", "Sorting"],
    testCases: [
      {
        input: `[[1,3],[2,6],[8,10],[15,18]]`,
        expectedOutput: `[[1,6],[8,10],[15,18]]`,
        isHidden: false,
        orderIndex: 1,
      },
      {
        input: `[[1,4],[4,5]]`,
        expectedOutput: `[[1,5]]`,
        isHidden: false,
        orderIndex: 2,
      },
      {
        input: `[[1,4],[0,4]]`,
        expectedOutput: `[[0,4]]`,
        isHidden: true,
        orderIndex: 3,
      },
    ],
  },
  {
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    description:
      "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "easy",
    constraints:
      "- The number of nodes in the list is the range `[0, 5005]`.\n- `-5005 <= Node.val <= 5005`",
    inputFormat: "An array representation of a linked list.",
    outputFormat: "An array representation of the reversed linked list.",
    sampleInput: `[1,2,3,4,5]`,
    sampleOutput: `[5,4,3,2,1]`,
    explanation: "The elements of the list are reversed.",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript: "function reverseList(head) {\n  // Write your code here\n}",
      python: "def reverse_list(head):\n    # Write your code here\n    pass",
    }),
    tags: ["Linked List", "Recursion"],
    testCases: [
      {
        input: `[1,2,3,4,5]`,
        expectedOutput: `[5,4,3,2,1]`,
        isHidden: false,
        orderIndex: 1,
      },
      {
        input: `[1,2]`,
        expectedOutput: `[2,1]`,
        isHidden: false,
        orderIndex: 2,
      },
      { input: `[]`, expectedOutput: `[]`, isHidden: true, orderIndex: 3 },
    ],
  },
  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    description:
      "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    difficulty: "hard",
    constraints:
      "- `n == height.length`\n- `1 <= n <= 2 * 104`\n- `0 <= height[i] <= 105`",
    inputFormat: "An array of integers `height`",
    outputFormat: "An integer representing the units of water trapped.",
    sampleInput: `[0,1,0,2,1,0,1,3,2,1,2,1]`,
    sampleOutput: `6`,
    explanation:
      "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript: "function trap(height) {\n  // Write your code here\n}",
      python: "def trap(height):\n    # Write your code here\n    pass",
    }),
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    testCases: [
      {
        input: `[0,1,0,2,1,0,1,3,2,1,2,1]`,
        expectedOutput: `6`,
        isHidden: false,
        orderIndex: 1,
      },
      {
        input: `[4,2,0,3,2,5]`,
        expectedOutput: `9`,
        isHidden: false,
        orderIndex: 2,
      },
      { input: `[1,1,1]`, expectedOutput: `0`, isHidden: true, orderIndex: 3 },
    ],
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    difficulty: "medium",
    constraints: "- `1 <= nums.length <= 105`\n- `-104 <= nums[i] <= 104`",
    inputFormat: "An array of integers `nums`",
    outputFormat: "An integer representing the maximum sum.",
    sampleInput: `[-2,1,-3,4,-1,2,1,-5,4]`,
    sampleOutput: `6`,
    explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript: "function maxSubArray(nums) {\n  // Write your code here\n}",
      python: "def max_sub_array(nums):\n    # Write your code here\n    pass",
    }),
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    testCases: [
      {
        input: `[-2,1,-3,4,-1,2,1,-5,4]`,
        expectedOutput: `6`,
        isHidden: false,
        orderIndex: 1,
      },
      { input: `[1]`, expectedOutput: `1`, isHidden: false, orderIndex: 2 },
      {
        input: `[5,4,-1,7,8]`,
        expectedOutput: `23`,
        isHidden: true,
        orderIndex: 3,
      },
    ],
  },
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    description:
      "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    difficulty: "easy",
    constraints: "- `1 <= n <= 45`",
    inputFormat: "An integer `n`",
    outputFormat:
      "An integer representing the number of distinct ways to climb to the top.",
    sampleInput: `2`,
    sampleOutput: `2`,
    explanation:
      "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript: "function climbStairs(n) {\n  // Write your code here\n}",
      python: "def climb_stairs(n):\n    # Write your code here\n    pass",
    }),
    tags: ["Math", "Dynamic Programming", "Memoization"],
    testCases: [
      { input: `2`, expectedOutput: `2`, isHidden: false, orderIndex: 1 },
      { input: `3`, expectedOutput: `3`, isHidden: false, orderIndex: 2 },
      { input: `4`, expectedOutput: `5`, isHidden: true, orderIndex: 3 },
    ],
  },
  {
    title: "LRU Cache",
    slug: "lru-cache",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the `key` if the key exists, otherwise return `-1`.\n- `void put(int key, int value)` Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, evict the least recently used key.",
    difficulty: "medium",
    constraints:
      "- `1 <= capacity <= 3000`\n- `0 <= key <= 104`\n- `0 <= value <= 105`",
    inputFormat: "Array of operations and arguments",
    outputFormat: "Array of return values",
    sampleInput: `["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]`,
    sampleOutput: `[null, null, null, 1, null, -1, null, -1, 3, 4]`,
    explanation: "LRUCache lRUCache = new LRUCache(2);\n...",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript:
        "class LRUCache {\n  constructor(capacity) {\n  }\n  get(key) {\n  }\n  put(key, value) {\n  }\n}",
      python:
        "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        pass\n    def put(self, key: int, value: int) -> None:\n        pass",
    }),
    tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    testCases: [
      {
        input: `["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]`,
        expectedOutput: `[null,null,null,1,null,-1,null,-1,3,4]`,
        isHidden: false,
        orderIndex: 1,
      },
    ],
  },
  {
    title: "Edit Distance",
    slug: "edit-distance",
    description:
      "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character",
    difficulty: "hard",
    constraints:
      "- `0 <= word1.length, word2.length <= 500`\n- `word1` and `word2` consist of lowercase English letters.",
    inputFormat: "Two strings `word1` and `word2`",
    outputFormat: "An integer representing the minimum operations.",
    sampleInput: `"horse"\n"ros"`,
    sampleOutput: `3`,
    explanation:
      "horse -> rorse (replace 'h' with 'r')\nrorse -> rose (remove 'r')\nrose -> ros (remove 'e')",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript:
        "function minDistance(word1, word2) {\n  // Write your code here\n}",
      python:
        "def min_distance(word1, word2):\n    # Write your code here\n    pass",
    }),
    tags: ["String", "Dynamic Programming"],
    testCases: [
      {
        input: `"horse"\n"ros"`,
        expectedOutput: `3`,
        isHidden: false,
        orderIndex: 1,
      },
      {
        input: `"intention"\n"execution"`,
        expectedOutput: `5`,
        isHidden: false,
        orderIndex: 2,
      },
      { input: `""\n"a"`, expectedOutput: `1`, isHidden: true, orderIndex: 3 },
    ],
  },
  {
    title: "Valid Anagram",
    slug: "valid-anagram",
    description:
      "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    difficulty: "easy",
    constraints:
      "- `1 <= s.length, t.length <= 5 * 104`\n- `s` and `t` consist of lowercase English letters.",
    inputFormat: "Two strings `s` and `t`",
    outputFormat: "A boolean indicating if `t` is an anagram of `s`.",
    sampleInput: `"anagram"\n"nagaram"`,
    sampleOutput: `true`,
    explanation:
      "All characters in 'nagaram' are present in 'anagram' with the same frequencies.",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript: "function isAnagram(s, t) {\n  // Write your code here\n}",
      python: "def is_anagram(s, t):\n    # Write your code here\n    pass",
    }),
    tags: ["Hash Table", "String", "Sorting"],
    testCases: [
      {
        input: `"anagram"\n"nagaram"`,
        expectedOutput: `true`,
        isHidden: false,
        orderIndex: 1,
      },
      {
        input: `"rat"\n"car"`,
        expectedOutput: `false`,
        isHidden: false,
        orderIndex: 2,
      },
      {
        input: `"a"\n"ab"`,
        expectedOutput: `false`,
        isHidden: true,
        orderIndex: 3,
      },
    ],
  },
  {
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    description:
      "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.",
    difficulty: "medium",
    constraints: "- `2 <= nums.length <= 105`\n- `-30 <= nums[i] <= 30`",
    inputFormat: "An array of integers `nums`",
    outputFormat: "An array of integers",
    sampleInput: `[1,2,3,4]`,
    sampleOutput: `[24,12,8,6]`,
    explanation: "Each element is the product of all other elements.",
    supportedLanguages: JSON.stringify(["javascript", "python", "java", "cpp"]),
    starterCode: JSON.stringify({
      javascript:
        "function productExceptSelf(nums) {\n  // Write your code here\n}",
      python:
        "def product_except_self(nums):\n    # Write your code here\n    pass",
    }),
    tags: ["Array", "Prefix Sum"],
    testCases: [
      {
        input: `[1,2,3,4]`,
        expectedOutput: `[24,12,8,6]`,
        isHidden: false,
        orderIndex: 1,
      },
      {
        input: `[-1,1,0,-3,3]`,
        expectedOutput: `[0,0,9,0,0]`,
        isHidden: false,
        orderIndex: 2,
      },
      {
        input: `[0,0]`,
        expectedOutput: `[0,0]`,
        isHidden: true,
        orderIndex: 3,
      },
    ],
  },
];

async function main() {
  console.log("Seeding 10 coding problems...");
  let count = 0;

  // Assume first user to assign as creator
  const user = await prisma.user.findFirst();
  const createdBy = user ? user.userId : 1;

  for (const p of problems) {
    const existing = await prisma.codingProblem.findUnique({
      where: { slug: p.slug },
    });

    if (!existing) {
      // First ensure tags exist
      const tagIds = [];
      for (const tagName of p.tags) {
        const tagSlug = tagName.toLowerCase().replace(/ /g, "-");
        const tag = await prisma.problemTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        tagIds.push(tag.tagId);
      }

      // Extract test cases
      const testCasesData = p.testCases;
      delete p.testCases;
      delete p.tags;

      // Create problem
      const createdProblem = await prisma.codingProblem.create({
        data: {
          ...p,
          createdBy,
          testCases: {
            create: testCasesData,
          },
          tags: {
            create: tagIds.map((id) => ({
              tag: { connect: { tagId: id } },
            })),
          },
        },
      });
      count++;
      console.log(`Created: ${createdProblem.title}`);
    } else {
      console.log(`Skipped (already exists): ${p.title}`);
    }
  }

  console.log(`Seeded ${count} new problems successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
