from datetime import datetime, timedelta

def calculate_total_work_time(check_in: datetime, check_out: datetime, leaves: list[datetime], returns: list[datetime]) -> timedelta:
    total_leave_time = sum([(returns[i] - leaves[i]) for i in range(len(leaves))], timedelta())
    total_work_time = check_out - check_in - total_leave_time
    return total_work_time
