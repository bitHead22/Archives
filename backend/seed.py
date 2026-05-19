import sys
from app.database import get_supabase

def seed():
    db = get_supabase()
    
    print("Inserting B.Tech CSE course...")
    course_name = "B.Tech CSE"
    # Check if exists
    c = db.table("courses").select("*").eq("name", course_name).execute()
    if c.data:
        course_id = c.data[0]['id']
    else:
        c_insert = db.table("courses").insert({
            "name": course_name,
            "description": "B.Tech in Computer Science and Engineering"
        }).execute()
        course_id = c_insert.data[0]['id']
        
    print(f"Course ID: {course_id}")
    
    for i in range(1, 9):
        s = db.table("semesters").select("*").eq("course_id", course_id).eq("number", i).execute()
        if not s.data:
            s_insert = db.table("semesters").insert({
                "course_id": course_id,
                "number": i,
                "label": f"Semester {i}"
            }).execute()
            sem_id = s_insert.data[0]['id']
        else:
            sem_id = s.data[0]['id']
            
        print(f"Ensured Sem {i} (ID: {sem_id})")
        
        # Insert dummy papers for Sem 3 (as per UI test)
        if i == 3:
            p = db.table("papers").select("*").eq("semester_id", sem_id).execute()
            if not p.data:
                dummy_papers = [
                    {"semester_id": sem_id, "subject": "Data Structures", "year": 2024, "exam_type": "first_term", "storage_path": "dummy", "ingested": True},
                    {"semester_id": sem_id, "subject": "Operating Systems", "year": 2023, "exam_type": "second_term", "storage_path": "dummy", "ingested": False},
                    {"semester_id": sem_id, "subject": "Computer Networks", "year": 2022, "exam_type": "end_sem", "storage_path": "dummy", "ingested": True},
                    {"semester_id": sem_id, "subject": "Digital Logic", "year": 2024, "exam_type": "end_sem", "storage_path": "dummy", "ingested": False},
                ]
                db.table("papers").insert(dummy_papers).execute()
                print("Inserted dummy papers for Semester 3!")
    
    print("Database seeding successfully completed!")

if __name__ == "__main__":
    seed()
