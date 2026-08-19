# Migrations — avertissement

La migration `20260818140000_auth_pairs_admin` contient des `DELETE FROM`
sur toutes les tables (nettoyage des données de démo de l'époque).

- Sur une base où elle est déjà appliquée : aucun risque, Prisma ne la
  rejouera jamais.
- **Ne jamais** pointer `prisma migrate deploy` vers une base qui contient
  des données mais pas la table `_prisma_migrations` (restauration de
  backup, nouvel environnement sur base existante) : la migration
  viderait la base. Dans ce cas, marquer d'abord les migrations comme
  appliquées avec `prisma migrate resolve --applied <name>`.

Ne pas modifier ces fichiers après application : Prisma vérifie leur
checksum au déploiement et refuserait de migrer.
