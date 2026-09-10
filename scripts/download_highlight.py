import instaloader
import sys
import base64

# highlight base64 string from url
# aGlnaGxpZ2h0OjE4MTQ5MTE3MDY1NTQzMDI5 -> highlight:18149117065543029
highlight_id = 18149117065543029

L = instaloader.Instaloader(dirname_pattern="public/images/payments_highlight", download_videos=False, download_comments=False, save_metadata=False)

try:
    print(f"Trying to get highlight {highlight_id}")
    # We might need to get the user's profile first to get their highlights
    profile = instaloader.Profile.from_username(L.context, "hypeafnan")
    print("Profile found. Getting highlights...")
    
    found = False
    for highlight in L.get_highlights(profile):
        if highlight.userid == highlight_id or highlight.title == "Payments" or str(highlight.userid) in str(highlight_id):
            # In instaloader, highlight object properties are a bit specific
            pass
        
        # Actually, let's just download the specific one if we can identify it, 
        # or we download all of them if there are few.
        print(f"Found highlight: {highlight.title} (ID: {highlight.userid})")
        if str(highlight_id) in str(highlight.userid) or "payment" in highlight.title.lower():
            print(f"Downloading highlight: {highlight.title}")
            for item in highlight.get_items():
                L.download_storyitem(item, f"payments")
            found = True
            break
            
    if not found:
        print("Could not find the specific highlight. It may require login or we misidentified it.")
        print("Let's try downloading all highlights for hypeafnan...")
        for highlight in L.get_highlights(profile):
             print(f"Downloading highlight: {highlight.title}")
             for item in highlight.get_items():
                 L.download_storyitem(item, f"{highlight.title}")
                 
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
