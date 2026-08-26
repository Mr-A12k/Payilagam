import json
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import GPT2Tokenizer

class CodingDataset(Dataset):
    def __init__(self, jsonl_path, block_size):
        self.tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
        self.block_size = block_size
        self.data = []

        # Load the data
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                obj = json.loads(line)
                text = obj['text']
                # Tokenize the text
                tokens = self.tokenizer.encode(text)
                self.data.extend(tokens)
                
    def __len__(self):
        return len(self.data) - self.block_size

    def __getitem__(self, idx):
        # We grab a chunk of length block_size + 1
        # The input x is the chunk without the last token
        # The target y is the chunk without the first token (shifted by 1)
        chunk = self.data[idx:idx + self.block_size + 1]
        x = torch.tensor(chunk[:-1], dtype=torch.long)
        y = torch.tensor(chunk[1:], dtype=torch.long)
        return x, y

def get_dataloader(jsonl_path, block_size, batch_size):
    dataset = CodingDataset(jsonl_path, block_size)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True, drop_last=True)
    vocab_size = dataset.tokenizer.vocab_size
    return dataloader, vocab_size
