# Photobooth Camo

Une application de photobooth pour Windows 10/11 qui utilise l’iPhone via la caméra virtuelle de **Camo Studio**. Chaque photo est enregistrée en JPEG sur l’ordinateur, par défaut dans `Images\\Photobooth`.

## Utilisation

1. Connectez l’iPhone au PC et ouvrez Camo sur l’iPhone.
2. Ouvrez Camo Studio sur Windows et vérifiez que l’image apparaît.
3. Lancez Photobooth Camo. L’application choisit automatiquement une caméra dont le nom contient « Camo » lorsqu’elle est disponible.
4. Cliquez sur **Prendre une photo**, ou appuyez sur la barre d’espace.
5. Après le compte à rebours, la photo est enregistrée automatiquement.

Le bouton **Changer** permet de choisir un autre dossier. Le bouton en haut à droite ou la touche `F11` active le plein écran.

## Obtenir l’installateur Windows depuis GitHub

1. Publiez ce projet dans un dépôt GitHub.
2. Ouvrez l’onglet **Actions** du dépôt.
3. Choisissez **Construire l’application Windows**, puis **Run workflow**.
4. Une fois le travail terminé, téléchargez l’artefact `Photobooth-Camo-Windows`.
5. Décompressez-le et lancez le fichier `.exe`.

Windows SmartScreen peut afficher un avertissement parce que l’application n’est pas signée avec un certificat payant. Choisissez **Informations complémentaires**, puis **Exécuter quand même** si vous avez téléchargé l’installateur depuis votre propre dépôt.

## Développement

Prérequis : [Node.js](https://nodejs.org/) 22 ou plus récent.

```powershell
npm install
npm start
```

Pour construire localement l’installateur sur Windows :

```powershell
npm run dist
```

Le résultat se trouve dans le dossier `dist`.

## Confidentialité

Tout fonctionne localement. Les images ne sont envoyées vers aucun serveur et restent dans le dossier choisi sur le PC.
