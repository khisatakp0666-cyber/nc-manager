// 📄 LockInfo.java

package org.recordapi.model;

public class LockInfo {
    private boolean locked;
    private String lockedBy;

    public LockInfo() {
    }

    public LockInfo(boolean locked, String lockedBy) {
        this.locked = locked;
        this.lockedBy = lockedBy;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public String getLockedBy() {
        return lockedBy;
    }

    public void setLockedBy(String lockedBy) {
        this.lockedBy = lockedBy;
    }
}