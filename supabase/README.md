# Database state

The live database equals schema-live-20261126.sql (read-only export taken before hardening) plus these patches, applied in order:
1. patches/step1-apply.sql (hardening: live_rooms policy, grants, role trigger, private realtime, get_shared_board rpc)
2. patches/step2-apply.sql (shared_boards listing closed)
3. patches/step3-live-images.sql (private storage bucket "live" and its policies)
patches/rollback.sql undoes steps 1 and 2. patches/hardening-proposed.sql is the original proposal, kept for reference.
