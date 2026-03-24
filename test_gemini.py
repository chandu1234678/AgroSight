"""
Test Google Gemini API integration
"""

import os
import sys

# Add backend to path
sys.path.insert(0, 'backend')

from dotenv import load_dotenv
load_dotenv('backend/.env')

def test_gemini():
    print("=" * 60)
    print("Testing Google Gemini API Integration")
    print("=" * 60)
    print()
    
    # Check if API key is set
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("✗ GEMINI_API_KEY not found in .env file")
        print()
        print("To fix:")
        print("1. Get free API key from: https://aistudio.google.com/apikey")
        print("2. Add to backend/.env: GEMINI_API_KEY=your_key_here")
        print("3. Run this test again")
        return
    
    print(f"✓ API key found: {api_key[:20]}...")
    print()
    
    # Try to import the library
    try:
        import google.generativeai as genai
        print("✓ google-generativeai package installed")
    except ImportError:
        print("✗ google-generativeai package not installed")
        print()
        print("To fix:")
        print("  Run: pip install google-generativeai")
        print("  Or: run install_gemini.bat")
        return
    
    print()
    
    # Try to initialize Gemini
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("✓ Gemini API initialized successfully")
        print(f"  Model: gemini-2.5-flash")
    except Exception as e:
        print(f"✗ Failed to initialize Gemini API: {e}")
        return
    
    print()
    print("-" * 60)
    print("Testing API with sample question...")
    print("-" * 60)
    print()
    
    # Test with a sample question
    try:
        test_question = "What is tomato late blight? Give a brief answer."
        print(f"Question: {test_question}")
        print()
        
        response = model.generate_content(test_question)
        print("Response:")
        print(response.text)
        print()
        print("✓ API test successful!")
        
    except Exception as e:
        print(f"✗ API test failed: {e}")
        print()
        if "429" in str(e):
            print("Rate limit exceeded. Wait a minute and try again.")
        elif "API_KEY" in str(e):
            print("Invalid API key. Get a new one from: https://aistudio.google.com/apikey")
    
    print()
    print("=" * 60)
    print("Test Complete!")
    print("=" * 60)
    print()
    print("If successful, your chat feature will now use real AI responses!")
    print("Restart your backend server to apply changes.")

if __name__ == "__main__":
    try:
        test_gemini()
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user")
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
