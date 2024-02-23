<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="glyph-list">
	<div class="glyph-list">
		<xsl:for-each select="./Set">
			<h2><xsl:value-of select="@name"/></h2>
			<xsl:for-each select="./*">
				<xsl:variable name="char" select="../../Unicode/*[@id = current()/@id]" />
				<div class="glyph">
					<xsl:if test="$char/@type = 'ws'"><xsl:attribute name="class">glyph white-space</xsl:attribute></xsl:if>
					<xsl:attribute name="title"><xsl:value-of select="$char/@name"/></xsl:attribute>
					<span class="thumbnail"><xsl:value-of select="$char/@value"/></span>
					<span class="name">
						<xsl:value-of select="$char/@value"/>
						<xsl:if test="$char/@type = 'ws'"><xsl:value-of select="$char/@name"/></xsl:if>
					</span>
				</div>
			</xsl:for-each>
		</xsl:for-each>
	</div>
</xsl:template>

</xsl:stylesheet>