<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="glyph-list">
	<div class="glyph-list">
		<h2>Letter, Latin</h2>
		<xsl:for-each select="./*">
			<xsl:variable name="char" select="../../Unicode/*[@id = current()/@id]" />
			<div class="glyph">
				<xsl:attribute name="title"><xsl:value-of select="$char/@name"/></xsl:attribute>
				<span class="thumbnail"><xsl:value-of select="$char/@value"/></span>
				<span class="name"><xsl:value-of select="$char/@value"/></span>
			</div>
		</xsl:for-each>
	</div>
</xsl:template>

</xsl:stylesheet>