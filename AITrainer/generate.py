import torch
from transformers import GPT2Tokenizer
from model import MiniGPT, MiniGPTConfig

def generate(prompt_text, max_new_tokens=50):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    # 1. Load Tokenizer
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    
    # 2. Re-initialize Model Structure
    config = MiniGPTConfig(
        vocab_size=tokenizer.vocab_size,
        block_size=64,
        n_layer=4,
        n_head=4,
        n_embd=128
    )
    model = MiniGPT(config)
    
    # 3. Load Trained Weights
    try:
        model.load_state_dict(torch.load('minigpt_model.pt', map_location=device))
        print("Model loaded successfully.")
    except FileNotFoundError:
        print("Error: minigpt_model.pt not found. Please run train.py first.")
        return

    model.to(device)
    model.eval()

    # 4. Tokenize Prompt
    input_ids = tokenizer.encode(prompt_text, return_tensors='pt').to(device)

    # 5. Generate
    print(f"\nGenerating response for: '{prompt_text}'\n")
    
    with torch.no_grad():
        generated_ids = model.generate(input_ids, max_new_tokens=max_new_tokens, temperature=0.8, top_k=40)
        
    # 6. Decode and Print
    output_text = tokenizer.decode(generated_ids[0].tolist(), skip_special_tokens=True)
    print("--- Output ---")
    print(output_text)
    print("--------------")

if __name__ == '__main__':
    prompt = "Q: Write a Python function to add two numbers.\nA:"
    generate(prompt, max_new_tokens=30)
