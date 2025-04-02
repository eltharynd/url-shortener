# URL Shortener and image hoster

This is a tracking/cookies/bs free url shortener and image hoster.

It's free to use and hosted at [eltha.wtf](https://eltha.wtf/).

You can also deploy your own.

```shell
docker buildx build --platform linux/amd64,linux/arm64 . -t eltharynd/url-shortener

## Publishing

```shell
docker push eltharynd/url-shortener
```
