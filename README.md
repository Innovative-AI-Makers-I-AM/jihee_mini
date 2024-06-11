conda create -n mini python=3.10 

pip install -r requirements.txt 

pip install "uvicorn[standard]" 

uvicorn main:app --reload
