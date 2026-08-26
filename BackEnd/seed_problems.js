const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting coding problems seed...');

    // Find the admin user to be the creator
    const adminUser = await prisma.user.findFirst({
        where: { role: { roleName: 'admin' } }
    });

    if (!adminUser) {
        console.error('No admin user found. Please run seed_tamil_data.js first.');
        process.exit(1);
    }

    // Two Sum Problem
    const twoSum = await prisma.codingProblem.upsert({
        where: { slug: 'two-sum' },
        update: {},
        create: {
            title: 'Two Sum',
            slug: 'two-sum',
            description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
            difficulty: 'easy',
            constraints: `- \`2 <= nums.length <= 10^4\`\n- \`-10^9 <= nums[i] <= 10^9\`\n- \`-10^9 <= target <= 10^9\`\n- Only one valid answer exists.`,
            inputFormat: `Line 1: A comma-separated list of integers representing the array.\nLine 2: An integer representing the target.`,
            outputFormat: `A comma-separated string of two indices.`,
            sampleInput: `2,7,11,15\n9`,
            sampleOutput: `0,1`,
            explanation: `nums[0] + nums[1] == 9, we return 0,1`,
            supportedLanguages: `["java"]`,
            starterCode: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.stdin);
        if (!scanner.hasNextLine()) return;
        
        String[] numsStr = scanner.nextLine().split(",");
        int[] nums = new int[numsStr.length];
        for (int i = 0; i < numsStr.length; i++) {
            nums[i] = Integer.parseInt(numsStr[i].trim());
        }
        
        int target = Integer.parseInt(scanner.nextLine().trim());
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + "," + result[1]);
    }

    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{0, 0};
    }
}`,
            createdBy: adminUser.userId,
            isActive: true,
        }
    });

    console.log(`Created problem: ${twoSum.title}`);

    // Create Test Cases for Two Sum
    const testCases = [
        { input: "2,7,11,15\n9", expectedOutput: "0,1\n", isHidden: false, orderIndex: 1 },
        { input: "3,2,4\n6", expectedOutput: "1,2\n", isHidden: false, orderIndex: 2 },
        { input: "3,3\n6", expectedOutput: "0,1\n", isHidden: true, orderIndex: 3 },
        { input: "1,5,9,14,22\n23", expectedOutput: "2,3\n", isHidden: true, orderIndex: 4 }
    ];

    for (const tc of testCases) {
        // Just create them blindly for now, avoiding upsert complexity without a unique constraint
        await prisma.testCase.create({
            data: {
                problemId: twoSum.problemId,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden,
                orderIndex: tc.orderIndex
            }
        });
    }
    console.log('Created test cases for Two Sum.');

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
