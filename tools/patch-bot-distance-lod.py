from pathlib import Path
from datetime import datetime
import re
import sys

p = Path("www/index.html")
s = p.read_text()

pattern = r"    function updateBots\(dt\) \{.*?(?=    function updateControlZone\(dt\) \{)"
matches = list(re.finditer(pattern, s, re.S))

if len(matches) != 1:
    sys.exit(f"GAGAL: ditemukan {len(matches)} fungsi updateBots, bukan 1.")

new = r'''    function updateBots(dt) {
      const playerX = camera.position.x;
      const playerZ = camera.position.z;
      const coverMeshes = colliders.map(c => c.mesh);

      bots.forEach(bot => {
        if (bot.isDead) {
          bot.respawnTimer -= dt;
          if (bot.respawnTimer <= 0) {
            bot.isDead = false;
            bot.hp = 100;
            const sb = FACTIONS[bot.faction].spawn;
            const respawnX = sb.x + (Math.random() - 0.5) * 14;
            const respawnZ = sb.z + (Math.random() - 0.5) * 14;
            bot.group.position.set(
              respawnX,
              getTerrainHeight(respawnX, respawnZ),
              respawnZ
            );
            const rx = respawnX - playerX;
            const rz = respawnZ - playerZ;
            bot.group.visible = rx * rx + rz * rz <= 180 * 180;
            setBotAnimation(bot, 'idle');
          }
          return;
        }

        const dx = bot.group.position.x - playerX;
        const dz = bot.group.position.z - playerZ;
        const playerDistSq = dx * dx + dz * dz;

        let lodInterval = 0;
        let distantSimulation = false;

        if (playerDistSq > 300 * 300) {
          lodInterval = 1.35;
          distantSimulation = true;
          bot.group.visible = false;
        } else if (playerDistSq > 180 * 180) {
          lodInterval = 0.65;
          distantSimulation = true;
          bot.group.visible = false;
        } else {
          bot.group.visible = true;
          if (playerDistSq > 80 * 80) lodInterval = 0.12;
        }

        let stepDt = dt;

        if (lodInterval > 0) {
          bot.lodAccumulator = (bot.lodAccumulator || 0) + dt;
          if (bot.lodAccumulator < lodInterval) return;
          stepDt = Math.min(bot.lodAccumulator, lodInterval * 1.5);
          bot.lodAccumulator = 0;
        } else {
          bot.lodAccumulator = 0;
        }

        bot.marker.rotation.y += stepDt * 2.5;

        let nearestTargetPos = null;
        let nearestTargetObj = null;
        let minDist = 75;

        bots.forEach(other => {
          if (other === bot || other.isDead || other.faction === bot.faction) return;
          const d = bot.group.position.distanceTo(other.group.position);
          if (d < minDist) {
            minDist = d;
            nearestTargetPos = other.group.position;
            nearestTargetObj = { type: 'bot', ref: other };
          }
        });

        if (bot.faction !== 'blue' && !state.isDead) {
          const playerFloorPos = new THREE.Vector3(playerX, 0, playerZ);
          const d = bot.group.position.distanceTo(playerFloorPos);
          if (d < minDist) {
            minDist = d;
            nearestTargetPos = playerFloorPos;
            nearestTargetObj = { type: 'player' };
          }
        }

        const distToZone = bot.group.position.length();
        bot.strafeTimer -= stepDt;
        if (bot.strafeTimer <= 0) {
          bot.strafeDir *= -1;
          bot.strafeTimer = 1.4 + Math.random() * 1.8;
        }

        const moveDir = new THREE.Vector3();
        if (distToZone > ZONE_RADIUS * 0.65) {
          moveDir.subVectors(new THREE.Vector3(0, 0, 0), bot.group.position).normalize();
        } else if (nearestTargetPos) {
          const toTarget = new THREE.Vector3()
            .subVectors(nearestTargetPos, bot.group.position).normalize();
          moveDir.set(-toTarget.z * bot.strafeDir, 0, toTarget.x * bot.strafeDir);
        }

        const botReturningToZone = distToZone > ZONE_RADIUS * 0.65;
        const botMoving = moveDir.lengthSq() > 0.0001;
        const speed = botReturningToZone ? 8.0 : 4.8;
        const animationName = !botMoving ? 'idle' :
          botReturningToZone ? 'run' : 'walk';

        if (!distantSimulation) {
          setBotAnimation(bot, animationName);
          if (bot.animationMixer) bot.animationMixer.update(stepDt);
        }

        const nextX = bot.group.position.clone().add(
          new THREE.Vector3(moveDir.x * speed * stepDt, 0, 0)
        );
        if (!checkPositionBlocked(nextX, 0.55)) bot.group.position.x = nextX.x;

        const nextZ = bot.group.position.clone().add(
          new THREE.Vector3(0, 0, moveDir.z * speed * stepDt)
        );
        if (!checkPositionBlocked(nextZ, 0.55)) bot.group.position.z = nextZ.z;

        const lookTarget = nearestTargetPos || new THREE.Vector3(0, 0, 0);
        bot.group.position.y = getTerrainHeight(
          bot.group.position.x, bot.group.position.z
        );

        bot.group.lookAt(
          lookTarget.x,
          getTerrainHeight(lookTarget.x, lookTarget.z) + 1.1,
          lookTarget.z
        );

        if (nearestTargetObj && minDist < 65) {
          bot.fireCooldown -= stepDt;
          if (bot.fireCooldown <= 0) {
            bot.fireCooldown = 0.65 + Math.random() * 0.75;

            if (distantSimulation) {
              if (Math.random() < 0.32) {
                if (nearestTargetObj.type === 'bot') {
                  damageBot(nearestTargetObj.ref, 18, bot.name, bot.faction);
                } else if (nearestTargetObj.type === 'player' && state.isPlaying) {
                  damagePlayer(12, bot.name, bot.faction);
                }
              }
            } else {
              const origin = bot.group.position.clone().add(
                new THREE.Vector3(0, 1.45, 0)
              );
              const targetAim = nearestTargetPos.clone().add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * 1.4,
                  1.3,
                  (Math.random() - 0.5) * 1.4
                )
              );

              const rayDir = new THREE.Vector3()
                .subVectors(targetAim, origin).normalize();
              const ray = new THREE.Raycaster(origin, rayDir, 0.3, 50);
              const hits = ray.intersectObjects(coverMeshes, false);

              let endPt = targetAim;
              if (hits.length > 0 && hits[0].distance < origin.distanceTo(targetAim)) {
                endPt = hits[0].point;
              } else if (Math.random() < 0.42) {
                if (nearestTargetObj.type === 'bot') {
                  damageBot(nearestTargetObj.ref, 18, bot.name, bot.faction);
                } else if (nearestTargetObj.type === 'player' && state.isPlaying) {
                  damagePlayer(12, bot.name, bot.faction);
                }
              }

              spawnBulletTracer(origin, endPt, FACTIONS[bot.faction].colorHex);
            }
          }
        }
      });
    }

'''

start, end = matches[0].span()
backup = p.with_name(
    p.name + ".backup-lod-" + datetime.now().strftime("%Y%m%d-%H%M%S")
)
backup.write_text(s)

s = s[:start] + new + s[end:]
p.write_text(s)

print("PATCH BERHASIL")
print("Backup:", backup.name)
print("Battle Distance LOD dipasang untuk 14 bot.")
