import os
import sys
import ftplib

def deploy():
    server = os.environ.get('FTP_SERVER')
    username = os.environ.get('FTP_USERNAME')
    password = os.environ.get('FTP_PASSWORD')
    port = int(os.environ.get('FTP_PORT', '21'))
    remote_root = os.environ.get('FTP_REMOTE_ROOT', '').strip()

    if not server or not username or not password:
        print("❌ Error: FTP_SERVER, FTP_USERNAME, or FTP_PASSWORD not provided!")
        sys.exit(1)

    print(f"Connecting to FTP server {server}:{port} as {username}...")
    ftp = ftplib.FTP()
    ftp.connect(server, port, timeout=60)
    ftp.login(username, password)
    ftp.set_pasv(True)

    print(f"✅ Successfully logged in to FTP server!")
    pwd = ftp.pwd()
    print(f"📂 Remote Initial Working Directory: {pwd}")

    items = []
    ftp.retrlines("LIST", items.append)
    print("📁 Remote directory contents:")
    for line in items:
        print(f"   {line}")

    # Determine target directory
    if remote_root and remote_root not in ['.', './', '/']:
        print(f"Navigating to specified FTP_REMOTE_ROOT: {remote_root}...")
        try:
            ftp.cwd(remote_root)
            print(f"📂 Switched to: {ftp.pwd()}")
        except Exception as e:
            print(f"⚠️ Could not cwd to {remote_root}: {e}")
    else:
        # Check if earshyogwe.com is an available subdirectory from the current position
        filenames = [line.split()[-1] for line in items if line]
        if "earshyogwe.com" in filenames and not pwd.endswith("earshyogwe.com"):
            print("Found 'earshyogwe.com' folder. Navigating into 'earshyogwe.com'...")
            ftp.cwd("earshyogwe.com")
            print(f"📂 Switched to: {ftp.pwd()}")
        elif "public_html" in filenames and not pwd.endswith("public_html"):
            sub_items = []
            try:
                ftp.retrlines("LIST public_html", sub_items.append)
                sub_names = [s.split()[-1] for s in sub_items if s]
                if "earshyogwe.com" in sub_names:
                    print("Found 'public_html/earshyogwe.com'. Navigating...")
                    ftp.cwd("public_html/earshyogwe.com")
                    print(f"📂 Switched to: {ftp.pwd()}")
            except Exception:
                pass

    final_pwd = ftp.pwd()
    print(f"📂 Final Target Working Directory: {final_pwd}\n")

    dist_dir = os.path.abspath("dist")
    if not os.path.exists(dist_dir):
        print(f"❌ Error: {dist_dir} does not exist!")
        sys.exit(1)

    def upload_recursive(local_path):
        for item in sorted(os.listdir(local_path)):
            full_local = os.path.join(local_path, item)
            if os.path.isfile(full_local):
                size = os.path.getsize(full_local)
                print(f"  ⬆️ Uploading: {item} ({size} bytes)")
                with open(full_local, "rb") as f:
                    ftp.storbinary(f"STOR {item}", f)
            elif os.path.isdir(full_local):
                print(f"📁 Processing directory: {item}")
                try:
                    ftp.mkd(item)
                    print(f"  ✓ Created remote directory: {item}")
                except Exception:
                    pass
                ftp.cwd(item)
                upload_recursive(full_local)
                ftp.cwd("..")

    print("🚀 Uploading dist/ files to web server...")
    upload_recursive(dist_dir)
    print("\n✅ Deployment completed successfully!")
    ftp.quit()

if __name__ == "__main__":
    deploy()
