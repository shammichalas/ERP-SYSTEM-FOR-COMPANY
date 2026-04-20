from datetime import datetime
from database import get_database
from models import AuditLog

async def log_event(action: str, target: str, performed_by: str, target_id: str = None, details: dict = None):
    db = get_database()
    log = AuditLog(
        action=action,
        target=target,
        target_id=target_id,
        performed_by=performed_by,
        timestamp=datetime.now().isoformat(),
        details=details
    )
    await db.audit_logs.insert_one(log.dict())
